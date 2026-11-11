<script>
	// @ts-nocheck
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { optionsLibrary, optionsMonth, defaultStyles } from '#lib/data/options.js';
	import { createPage, createEvent } from '#lib/utils/factories.js';
	import { slide } from 'svelte/transition';
	import Generator from '#lib/layout/Generator.svelte';
	import ContainerAffiche from '../lib/layout/ContainerAffiche.svelte';
	import EventEditor from '#lib/components/affiche/EventEditor.svelte';

	const selectedLibrary = useLocalStorage('selectedLibraryId', null);
	const selectedMonth = useLocalStorage('selectedMonthId', null);

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

	const pages = useLocalStorage('pages', [createPage()]);

	let nbPages = $derived(pages.current.length);

	function addPage() {
		pages.current = [...pages.current, createPage()];
	}

	function deletePage(pageId) {
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

	function removeEvent(pageId) {
		pages.current = pages.current.map((page) =>
			page.id === pageId && page.events.length > 1
				? { ...page, events: page.events.slice(0, -1) }
				: page
		);
	}

	function toggleReverse(pageId, checked) {
		pages.current = pages.current.map((page) =>
			page.id === pageId ? { ...page, reverse: checked } : page
		);
	}

	function resetEvents() {
		const confirmation = confirm('Voulez-vous vraiment réinitialiser tous les évènements ?');

		if (!confirmation) return;

		pages.current = [createPage()];
	}

	function resetAll() {
		const confirmation = confirm(
			'Voulez-vous vraiment tout réinitialiser ? Cette action supprimera toutes les affiches et remettra les paramètres par défaut.'
		);

		if (!confirmation) return;

		pages.current = [createPage()];
		selectedLibrary.current = null;
		selectedMonth.current = null;
		styles.current = { ...defaultStyles };
	}
</script>

<Generator
	{nbPages}
	{addPage}
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
