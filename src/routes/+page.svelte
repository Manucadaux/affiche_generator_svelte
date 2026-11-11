<script>
	// @ts-nocheck
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { optionsLibrary, optionsMonth, defaultStyles } from '#lib/data/options.js';
	import { createPage, createEvent, generateId } from '#lib/utils/factories.js';
	import {
		deleteEventImage,
		cleanupOrphanedImages,
		getEventImage,
		saveEventImage
	} from '#lib/utils/imageStorage.js';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Generator from '#lib/layout/Generator.svelte';
	import ContainerAffiche from '../lib/layout/ContainerAffiche.svelte';
	import EventEditor from '#lib/components/affiche/EventEditor.svelte';

	const selectedLibrary = useLocalStorage('selectedLibraryId', null);
	const selectedMonth = useLocalStorage('selectedMonthId', null);
	const pages = useLocalStorage('pages', [createPage()]);

	onMount(() => {
		const validEventIds = pages.current.flatMap((page) => page.events.map((event) => event.id));

		cleanupOrphanedImages(validEventIds).catch((error) => {
			console.error('Erreur lors du nettoyage des images :', error);
		});
	});

	let selectedLibraryData = $derived(
		optionsLibrary.find((option) => option.id === selectedLibrary.current) ?? null
	);

	let selectedMonthData = $derived(
		optionsMonth.find((option) => option.id === selectedMonth.current) ?? null
	);

	let selectedEventId = $state(null);

	function selectEvent(eventId) {
		selectedEventId = eventId;
	}

	let selectedEvent = $derived(
		pages.current.flatMap((page) => page.events).find((event) => event.id === selectedEventId) ??
			null
	);

	function updateEvent(eventId, field, value) {
		pages.current = pages.current.map((page) => ({
			...page,
			events: page.events.map((event) =>
				event.id === eventId ? { ...event, [field]: value } : event
			)
		}));
	}

	const styles = useLocalStorage('styles', defaultStyles);

	let nbPages = $derived(pages.current.length);

	function addPage(pageId) {
		const index = pages.current.findIndex((page) => page.id === pageId);

		if (index === -1) return;

		const newPages = [...pages.current];
		newPages.splice(index + 1, 0, createPage());

		pages.current = newPages;
	}

	async function duplicatePage(pageId) {
		const sourcePage = pages.current.find((page) => page.id === pageId);

		if (!sourcePage) return;

		// Créer une copie avec de nouveaux identifiants
		const duplicatedPage = {
			...sourcePage,
			id: generateId(),
			events: sourcePage.events.map((event) => ({
				...event,
				id: generateId()
			}))
		};

		try {
			// Copier les images associées aux événements
			await Promise.all(
				sourcePage.events.map(async (event, index) => {
					const image = await getEventImage(event.id);

					if (image) {
						await saveEventImage(duplicatedPage.events[index].id, image);
					}
				})
			);

			// Insérer la copie juste après la page originale
			const index = pages.current.findIndex((page) => page.id === pageId);

			if (index === -1) {
				await deleteEventImages(duplicatedPage.events);
				return;
			}

			const newPages = [...pages.current];
			newPages.splice(index + 1, 0, duplicatedPage);

			pages.current = newPages;
		} catch (error) {
			// Nettoyer les éventuelles images déjà copiées
			await deleteEventImages(duplicatedPage.events);

			console.error('Erreur lors de la duplication de la page :', error);
			alert('Impossible de dupliquer la page.');
		}
	}

	async function deleteEventImages(events) {
		const results = await Promise.allSettled(events.map((event) => deleteEventImage(event.id)));

		results.forEach((result) => {
			if (result.status === 'rejected') {
				console.error('Erreur lors de la suppression d’une image :', result.reason);
			}
		});
	}

	async function deletePage(pageId) {
		const confirmation = confirm(
			'Voulez-vous vraiment supprimer cette page et tous ses évènements ?'
		);

		if (!confirmation) return;

		const page = pages.current.find((page) => page.id === pageId);

		if (!page) return;

		await deleteEventImages(page.events);

		if (page.events.some((event) => event.id === selectedEventId)) {
			selectedEventId = null;
		}

		pages.current = pages.current.filter((page) => page.id !== pageId);
	}

	function addEvent(pageId) {
		pages.current = pages.current.map((page) =>
			page.id === pageId && page.events.length < 4
				? {
						...page,
						events: [...page.events, createEvent()]
					}
				: page
		);
	}

	async function removeEvent(pageId) {
		const page = pages.current.find((page) => page.id === pageId);

		if (!page || page.events.length <= 1) return;

		const eventToRemove = page.events[page.events.length - 1];

		await deleteEventImages([eventToRemove]);

		if (eventToRemove.id === selectedEventId) {
			selectedEventId = null;
		}

		pages.current = pages.current.map((page) =>
			page.id === pageId ? { ...page, events: page.events.slice(0, -1) } : page
		);
	}

	function toggleReverse(pageId, checked) {
		pages.current = pages.current.map((page) =>
			page.id === pageId ? { ...page, reverse: checked } : page
		);
	}

	async function resetEvents() {
		const confirmation = confirm('Voulez-vous vraiment réinitialiser tous les évènements ?');

		if (!confirmation) return;

		const allEvents = pages.current.flatMap((page) => page.events);

		await deleteEventImages(allEvents);

		selectedEventId = null;
		pages.current = [createPage()];
	}

	async function resetAll() {
		const confirmation = confirm(
			'Voulez-vous vraiment tout réinitialiser ? Cette action supprimera toutes les affiches et remettra les paramètres par défaut.'
		);

		if (!confirmation) return;

		const allEvents = pages.current.flatMap((page) => page.events);

		await deleteEventImages(allEvents);

		selectedEventId = null;
		pages.current = [createPage()];
		selectedLibrary.current = null;
		selectedMonth.current = null;
		styles.current = { ...defaultStyles };
	}
</script>

<Generator
	{nbPages}
	{optionsLibrary}
	{optionsMonth}
	bind:selectedLibrary={selectedLibrary.current}
	bind:selectedMonth={selectedMonth.current}
	bind:styles={styles.current}
	onResetEvents={resetEvents}
	onResetAll={resetAll}
/>

<div class="container">
	{#each pages.current as page, i (page.id)}
		<div out:slide={{ duration: 500 }}>
			<ContainerAffiche
				pageNumber={i + 1}
				selectedLibrary={selectedLibraryData}
				selectedMonth={selectedMonthData}
				{page}
				styles={styles.current}
				canDelete={pages.current.length > 1}
				onDeletePage={deletePage}
				onAddEvent={addEvent}
				onRemoveEvent={removeEvent}
				onToggleReverse={toggleReverse}
				onSelectEvent={selectEvent}
				isEditing={selectedEvent !== null}
				onAddPage={addPage}
				onDuplicatePage={duplicatePage}
			/>
		</div>
	{/each}
</div>

{#if selectedEvent}
	<button
		class="editorBackdrop"
		aria-label="Fermer l'éditeur"
		onclick={() => (selectedEventId = null)}
	></button>

	<div class="editorContainer card border border-base-300 bg-base-100 shadow-xl">
		<EventEditor
			event={selectedEvent}
			onUpdateEvent={updateEvent}
			onClose={() => (selectedEventId = null)}
		/>
	</div>
{/if}

<style>
	:global {
		html,
		body {
			height: 100%;
			width: 100%;
		}
	}

	.container {
		display: flex;
		flex-direction: column;
		gap: 40px;
		width: calc(100% - 360px);
		position: absolute;
		top: 10px;
		left: 350px;
		padding-bottom: 40px;
	}

	.editorContainer {
		position: fixed;
		top: 10px;
		right: 20px;
		width: 380px;
		height: calc(100vh - 20px);
		overflow-y: auto;
		z-index: 10;
	}

	.editorBackdrop {
		position: fixed;
		inset: 0;
		z-index: 9;
		padding: 0;
		border: none;
		background: transparent;
		cursor: default;
	}

	.editorContainer {
		z-index: 10;
	}
</style>
