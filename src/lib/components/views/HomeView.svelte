<script>
	// @ts-nocheck
	import { optionsLibrary, optionsMonth, defaultStyles } from '#lib/data/options.js';

	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { createPage, createEvent, generateId } from '#lib/utils/factories.js';
	import {
		deleteEventImages,
		cleanupOrphanedImages,
		getEventImage,
		saveEventImage
	} from '#lib/utils/imageStorage.js';
	import { scrollToPage } from '#lib/utils/scroll.js';
	import { createPageActions } from '#lib/utils/pageActions.js';
	import { createEventActions } from '#lib/utils/eventActions.js';
	import { createResetActions } from '#lib/utils/resetActions.js';

	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	import Generator from '#lib/layout/Generator.svelte';
	import ContainerAffiche from '#lib/layout/ContainerAffiche.svelte';
	import EventEditor from '#lib/components/affiche/EventEditor.svelte';

	let { renderHref = '/render' } = $props();

	const selectedLibrary = useLocalStorage('selectedLibraryId', null);
	const selectedMonth = useLocalStorage('selectedMonthId', null);
	const pages = useLocalStorage('pages', [createPage()]);
	const styles = useLocalStorage('styles', defaultStyles);
	const selectedTheme = useLocalStorage('selectedTheme', 'system');

	let selectedEventId = $state(null);
	let systemPrefersDark = $state(null);

	const { addPage, duplicatePage, deletePage } = createPageActions({
		pages,
		createPage,
		generateId,
		getEventImage,
		saveEventImage,
		deleteEventImages,
		scrollToPage,
		getSelectedEventId: () => selectedEventId,
		clearSelectedEvent: () => (selectedEventId = null)
	});

	const { addEvent, removeEvent, toggleReverse, updateEvent } = createEventActions({
		pages,
		createEvent,
		deleteEventImages,
		getSelectedEventId: () => selectedEventId,
		clearSelectedEvent: () => (selectedEventId = null)
	});

	const { resetEvents, resetAll } = createResetActions({
		pages,
		createPage,
		deleteEventImages,
		clearSelectedEvent: () => (selectedEventId = null),
		selectedLibrary,
		selectedMonth,
		styles,
		defaultStyles
	});

	onMount(() => {
		const validEventIds = pages.current.flatMap((page) => page.events.map((event) => event.id));

		cleanupOrphanedImages(validEventIds).catch((error) => {
			console.error('Erreur lors du nettoyage des images :', error);
		});
	});

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		// Lire la préférence initiale du système
		systemPrefersDark = mediaQuery.matches;

		// Suivre les changements du système
		const handleSystemChange = (event) => {
			systemPrefersDark = event.matches;
		};

		mediaQuery.addEventListener('change', handleSystemChange);

		return () => {
			mediaQuery.removeEventListener('change', handleSystemChange);
		};
	});

	$effect(() => {
		if (!selectedTheme.ready || systemPrefersDark === null) return;

		const theme =
			selectedTheme.current === 'system'
				? systemPrefersDark
					? 'dark'
					: 'light'
				: selectedTheme.current;

		document.documentElement.setAttribute('data-theme', theme);
	});

	let selectedLibraryData = $derived(
		optionsLibrary.find((option) => option.id === selectedLibrary.current) ?? null
	);

	let selectedMonthData = $derived(
		optionsMonth.find((option) => option.id === selectedMonth.current) ?? null
	);

	function selectEvent(eventId) {
		selectedEventId = eventId;
	}

	let selectedEvent = $derived(
		pages.current.flatMap((page) => page.events).find((event) => event.id === selectedEventId) ??
			null
	);

	let isReady = $derived(
		pages.ready &&
			styles.ready &&
			selectedLibrary.ready &&
			selectedMonth.ready &&
			selectedTheme.ready
	);

	let nbPages = $derived(pages.current.length);
</script>

{#if isReady}
	<Generator
		{nbPages}
		{optionsLibrary}
		{optionsMonth}
		{renderHref}
		bind:selectedLibrary={selectedLibrary.current}
		bind:selectedMonth={selectedMonth.current}
		bind:styles={styles.current}
		bind:selectedTheme={selectedTheme.current}
		onResetEvents={resetEvents}
		onResetAll={resetAll}
	/>

	<div class="container">
		{#each pages.current as page, i (page.id)}
			<div id={`page-${page.id}`} out:slide={{ duration: 500 }}>
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
					{selectedEventId}
				/>
			</div>
		{/each}
	</div>
{:else}
	<div class="loaderContainer">
		<span class="loading loading-lg loading-spinner"></span>
		<p>Chargement...</p>
	</div>
{/if}

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

	.loaderContainer {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 12px;
	}
</style>
