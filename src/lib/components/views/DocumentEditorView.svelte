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
	import { subscribeToDocumentChanges } from '#lib/utils/documentSync.js';

	import { slide } from 'svelte/transition';
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';

	import Toast from '#lib/components/ui/Toast.svelte';
	import Generator from '#lib/components/document-editor/Generator.svelte';
	import PageEditor from '#lib/components/document-editor/PageEditor.svelte';
	import EventEditor from '#lib/components/document-editor/EventEditor.svelte';

	let { documentId } = $props();

	let renderHref = $derived(`/render?documentId=${encodeURIComponent(documentId)}`);

	const selectedTheme = useLocalStorage('selectedTheme', 'system');

	/** @type {AppDocument | null} */
	let activeDocument = $state(null);

	let isDocumentDeleted = $state(false);

	let loadedDocumentId = $state(undefined);
	let lastSavedSnapshot = '';

	let isResetting = $state(false);

	/** @type {'success' | 'error' | 'info' | 'warning'} */
	let toastType = $state('error');
	let toastMessage = $state('');

	/** @type {AppDocument[]} */
	let documents = $state([]);

	/** @returns {Promise<void>} */
	async function handleResetEvents() {
		isResetting = true;

		try {
			await resetEvents();
		} finally {
			await tick();
			isResetting = false;
		}
	}

	/** @returns {Promise<void>} */
	async function handleResetAll() {
		isResetting = true;

		try {
			await resetAll();
		} finally {
			await tick();
			isResetting = false;
		}
	}

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

	/**
	 * Ajoute une sauvegarde à la file d'attente.
	 * @param {AppDocument} document
	 * @returns {Promise<void>}
	 */
	function enqueueDocumentSave(document) {
		const plainDocument = $state.snapshot(document);
		const snapshot = JSON.stringify(plainDocument);

		const updatedDocument = {
			...plainDocument,
			updatedAt: new Date().toISOString()
		};

		// Une erreur précédente ne doit pas empêcher les sauvegardes suivantes.
		const saveOperation = saveQueue
			.catch(() => {})
			.then(async () => {
				const updated = await saveStoredDocument(updatedDocument);

				if (!updated) {
					throw new Error('Le document n’existe plus.');
				}

				lastSavedSnapshot = snapshot;
			});

		saveQueue = saveOperation;
		return saveOperation;
	}

	/**
	 * Enregistre le document courant avant une navigation.
	 * @returns {Promise<boolean>}
	 */
	async function saveCurrentDocument() {
		await tick();

		if (!documentReady || !activeDocument || isDocumentDeleted) {
			return false;
		}

		try {
			// Attend les sauvegardes déjà en cours.
			await saveQueue.catch(() => {});

			// Vérifie à nouveau la version la plus récente après l'attente.
			const snapshot = JSON.stringify(activeDocument);

			if (snapshot !== lastSavedSnapshot) {
				await enqueueDocumentSave(activeDocument);
			}

			return true;
		} catch (error) {
			console.error('Erreur lors de la sauvegarde avant navigation :', error);
			toastType = 'error';
			toastMessage =
				'Impossible d’enregistrer le document. Veuillez réessayer avant de changer de document.';
			return false;
		}
	}

	/**
	 * Retourne à la liste des documents après sauvegarde.
	 * @returns {Promise<void>}
	 */
	async function handleNavigateHome() {
		const saved = await saveCurrentDocument();

		if (!saved) return;

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('/');
	}

	/**
	 * Ouvre un autre document après sauvegarde du document courant.
	 * @param {string} nextDocumentId
	 * @returns {Promise<void>}
	 */
	async function handleNavigate(nextDocumentId) {
		const saved = await saveCurrentDocument();

		if (!saved) return;

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(`/document-editor?documentId=${encodeURIComponent(nextDocumentId)}`);
	}

	// Sauvegarde automatique : comportement d'erreur inchangé.
	$effect(() => {
		const currentDocument = activeDocument;

		if (!documentReady || !currentDocument) return;

		const snapshot = JSON.stringify(currentDocument);
		if (snapshot === lastSavedSnapshot) return;

		enqueueDocumentSave(currentDocument).catch((error) => {
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

	const { addPage, addPageAndScroll, duplicatePage, deletePage, deleteLastPage } =
		createPageActions({
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

	/**
	 * Ajoute une page à la fin du document, sans défilement.
	 * @returns {Page | null}
	 */
	function handleAddPage() {
		const lastPage = pages.current.at(-1);

		if (!lastPage) return null;

		return addPage(lastPage.id);
	}

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

	const isReady = $derived(documentReady && selectedTheme.ready && !isDocumentDeleted);

	let nbPages = $derived(pages.current.length);

	/**
	 * Actualise la liste des documents.
	 * @returns {Promise<void>}
	 */
	async function refreshDocuments() {
		try {
			documents = await getAllDocuments();
		} catch (error) {
			console.error('Erreur lors du chargement des documents :', error);
		}
	}

	onMount(() => {
		refreshDocuments();

		return subscribeToDocumentChanges(async () => {
			try {
				const [document] = await Promise.all([getStoredDocument(documentId), refreshDocuments()]);

				if (!document) {
					isDocumentDeleted = true;
				}
			} catch (error) {
				console.error('Erreur lors de la vérification du document :', error);
			}
		});
	});
</script>

{#if isDocumentDeleted}
	<div class="loaderContainer">
		<p>Ce document a été supprimé dans un autre onglet.</p>

		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/" class="link">Retour aux documents</a>
	</div>
{:else if isReady}
	<Generator
		{nbPages}
		{optionsLibrary}
		{optionsMonth}
		{renderHref}
		{documents}
		currentDocumentId={documentId}
		bind:selectedLibrary={selectedLibrary.current}
		bind:selectedMonth={selectedMonth.current}
		bind:styles={styles.current}
		bind:selectedTheme={selectedTheme.current}
		bind:documentName={documentName.current}
		onResetEvents={handleResetEvents}
		onResetAll={handleResetAll}
		onAddPage={handleAddPage}
		onDeleteLastPage={deleteLastPage}
		onNavigateHome={handleNavigateHome}
		onNavigate={handleNavigate}
	/>

	<div class="container">
		{#each pages.current as page, i (page.id)}
			<div id={`page-${page.id}`} out:slide={{ duration: isResetting ? 0 : 500 }}>
				<PageEditor
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
					onAddPage={addPageAndScroll}
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

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} onClose={() => (toastMessage = '')} />
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
