<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */
	/** @typedef {import('#lib/utils/types.js').Page} Page */
	/** @typedef {import('#lib/utils/types.js').Styles} Styles */

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

	import {
		getDocument as getStoredDocument,
		updateDocument as saveStoredDocument,
		getAllDocuments
	} from '#lib/utils/documentStorage.js';

	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	import Generator from '#lib/layout/Generator.svelte';
	import ContainerAffiche from '#lib/layout/ContainerAffiche.svelte';
	import EventEditor from '#lib/components/affiche/EventEditor.svelte';

	let { documentId, renderHref = '/render' } = $props();

	const selectedTheme = useLocalStorage('selectedTheme', 'system');

	/** @type {AppDocument | null} */
	let activeDocument = $state(null);

	let loadedDocumentId = $state(undefined);
	let lastSavedSnapshot = '';

	// Chargement du document demandé
	$effect(() => {
		if (!documentId || loadedDocumentId === documentId) return;

		let cancelled = false;

		async function loadDocument() {
			try {
				const document = await getStoredDocument(documentId);

				if (cancelled) return;

				activeDocument = document;
				loadedDocumentId = documentId;

				if (document) {
					lastSavedSnapshot = JSON.stringify(document);
				}
			} catch (error) {
				console.error('Erreur lors du chargement du document :', error);
			}
		}

		loadDocument();

		return () => {
			cancelled = true;
		};
	});

	const documentReady = $derived(loadedDocumentId === documentId && activeDocument !== null);

	const documentMissing = $derived(loadedDocumentId === documentId && activeDocument === null);

	// Stores compatibles avec les actions et le Generator existants
	const pages = {
		get current() {
			return activeDocument?.pages ?? [];
		},
		set current(value) {
			if (activeDocument) {
				activeDocument = { ...activeDocument, pages: value };
			}
		},
		get ready() {
			return documentReady;
		}
	};

	const styles = {
		get current() {
			return activeDocument?.styles ?? defaultStyles;
		},
		set current(value) {
			if (activeDocument) {
				activeDocument = { ...activeDocument, styles: value };
			}
		},
		get ready() {
			return documentReady;
		}
	};

	const selectedLibrary = {
		get current() {
			return activeDocument?.libraryId ?? null;
		},
		set current(value) {
			if (activeDocument) {
				activeDocument = { ...activeDocument, libraryId: value };
			}
		},
		get ready() {
			return documentReady;
		}
	};

	const selectedMonth = {
		get current() {
			return activeDocument?.monthId ?? null;
		},
		set current(value) {
			if (activeDocument) {
				activeDocument = { ...activeDocument, monthId: value };
			}
		},
		get ready() {
			return documentReady;
		}
	};

	const documentName = {
		get current() {
			return activeDocument?.name ?? '';
		},
		set current(value) {
			if (activeDocument) {
				activeDocument = { ...activeDocument, name: value };
			}
		},
		get ready() {
			return documentReady;
		}
	};

	// Sauvegarde automatique dans IndexedDB
	let saveQueue = Promise.resolve();

	$effect(() => {
		const currentDocument = activeDocument;

		if (!documentReady || !currentDocument) return;

		const snapshot = JSON.stringify(currentDocument);

		if (snapshot === lastSavedSnapshot) return;

		const updatedDocument = JSON.parse(snapshot);
		updatedDocument.updatedAt = new Date().toISOString();

		saveQueue = saveQueue
			.then(async () => {
				await saveStoredDocument(updatedDocument);

				lastSavedSnapshot = snapshot;

				console.info(`Document "${updatedDocument.name}" sauvegardé.`);
			})
			.catch((error) => {
				console.error('Erreur lors de la sauvegarde du document :', error);
			});
	});

	// Nettoyage des images en tenant compte de tous les documents
	let hasCleanedImages = false;

	$effect(() => {
		if (!documentReady || hasCleanedImages) return;

		hasCleanedImages = true;

		async function cleanImages() {
			try {
				const documents = await getAllDocuments();

				const validEventIds = documents.flatMap((document) =>
					document.pages.flatMap((page) => page.events.map((event) => event.id))
				);

				await cleanupOrphanedImages(validEventIds);
			} catch (error) {
				console.error('Erreur lors du nettoyage des images :', error);
			}
		}

		cleanImages();
	});

	/** @type {string | null} */
	let selectedEventId = $state(null);

	/** @type {boolean | null} */
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
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		systemPrefersDark = mediaQuery.matches;

		/** @param {MediaQueryListEvent} event */
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

	/** @param {string} eventId */
	function selectEvent(eventId) {
		selectedEventId = eventId;
	}

	let selectedEvent = $derived(
		pages.current.flatMap((page) => page.events).find((event) => event.id === selectedEventId) ??
			null
	);

	let isReady = $derived(documentReady && selectedTheme.ready);

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
		bind:documentName={documentName.current}
		onResetEvents={resetEvents}
		onResetAll={resetAll}
	/>

	<div class="container">
		{#each pages.current as page, i (page.id)}
			<div id={`page-${page.id}`} out:slide={{ duration: 500 }}>
				<ContainerAffiche
					pageNumber={i + 1}
					totalPages={nbPages}
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
{:else if documentMissing}
	<div class="loaderContainer">
		<p>Ce document est introuvable.</p>

		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/" class="link">Retour aux documents</a>
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
