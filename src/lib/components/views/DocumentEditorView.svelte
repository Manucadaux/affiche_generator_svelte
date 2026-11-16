<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */
	/** @typedef {import('#lib/utils/types.js').Page} Page */
	/** @typedef {import('#lib/utils/types.js').Styles} Styles */
	/** @typedef {import('#lib/utils/types.js').Event} Event */

	import { optionsLibrary, optionsMonth, defaultStyles } from '#lib/data/options.js';

	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { createPage, createEvent, generateId } from '#lib/utils/factories.js';
	import {
		deleteEventImages,
		deleteEventImage,
		cleanupOrphanedImages,
		getEventImage,
		saveEventImage
	} from '#lib/utils/imageStorage.js';
	import { scrollToPage } from '#lib/utils/scroll.js';
	import { createPageActions } from '#lib/utils/pageActions.js';
	import { createEventActions } from '#lib/utils/eventActions.js';
	import { createResetActions } from '#lib/utils/resetActions.js';
	import { getDocument as getStoredDocument, getAllDocuments } from '#lib/utils/documentStorage.js';
	import { subscribeToDocumentChanges } from '#lib/utils/documentSync.js';
	import { createHistory, recordChange } from '#lib/utils/history.js';
	import { setupHistoryKeyboard } from '#lib/utils/historyKeyboard.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';
	import { createDocumentPersistence } from '#lib/utils/editor/documentPersistence.svelte.js';

	import { slide } from 'svelte/transition';
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';

	import Toast from '#lib/components/ui/Toast.svelte';
	import EditorToolbar from '#lib/components/document-editor/EditorToolbar.svelte';
	import Generator from '#lib/components/document-editor/Generator.svelte';
	import PageEditor from '#lib/components/document-editor/PageEditor.svelte';
	import EventEditor from '#lib/components/document-editor/EventEditor.svelte';

	let { documentId } = $props();

	const A3_WIDTH_PX = (297 / 25.4) * 96;
	const A3_HEIGHT_PX = (420 / 25.4) * 96;

	let renderHref = $derived(`/render?documentId=${encodeURIComponent(documentId)}`);

	const selectedTheme = useLocalStorage('selectedTheme', 'system');
	applyTheme(selectedTheme);

	/** @type {AppDocument | null} */
	let activeDocument = $state(null);

	/** @type {{ canUndo: boolean, canRedo: boolean }} */
	let historyState = $state({
		canUndo: false,
		canRedo: false
	});

	const history = createHistory({
		limit: 50,
		onChange: (state) => {
			historyState = state;
		}
	});

	let isDocumentDeleted = $state(false);
	let loadedDocumentId = $state(undefined);
	let isResetting = $state(false);

	/** @type {'success' | 'error' | 'info' | 'warning'} */
	let toastType = $state('error');
	let toastMessage = $state('');

	/** @type {AppDocument[]} */
	let documents = $state([]);

	const documentPersistence = createDocumentPersistence();

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
				const document = await documentPersistence.loadDocument(documentId);

				if (cancelled) return;

				activeDocument = document;
				loadedDocumentId = documentId;
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

	// Sauvegarde du document avant une navigation

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
			await documentPersistence.saveCurrentDocument(activeDocument);
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

	// Sauvegarde automatique
	$effect(() => {
		const currentDocument = activeDocument;

		if (!documentReady || !currentDocument) return;
		if (!documentPersistence.hasChanged(currentDocument)) return;

		documentPersistence.enqueueDocumentSave(currentDocument).catch((error) => {
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

	// Calcul automatique du zoom pour afficher la page A3 entière.
	$effect(() => {
		if (!documentReady || styles.current.autoZoom === false) return;

		let cancelled = false;
		/** @type {ResizeObserver | null} */
		let resizeObserver = null;

		function updateAutoZoom() {
			const pageContainer = document.querySelector('.pageContainer');

			if (!(pageContainer instanceof HTMLElement)) return;

			const availableWidth = pageContainer.clientWidth;

			// Le conteneur commence à 10px du haut de la fenêtre.
			// On réserve également 40px pour le padding et 20px en bas.
			const pageTop = pageContainer.getBoundingClientRect().top;
			const availableHeight = window.innerHeight - pageTop - 60;

			if (availableWidth <= 0 || availableHeight <= 0) return;

			const widthZoom = (availableWidth / A3_WIDTH_PX) * 100;
			const heightZoom = (availableHeight / A3_HEIGHT_PX) * 100;

			const zoom = Math.max(1, Math.floor(Math.min(widthZoom, heightZoom, 100)));

			if (styles.current.autoZoom && styles.current.zoom !== zoom) {
				styles.current = { ...styles.current, zoom };
			}
		}

		tick().then(() => {
			if (cancelled) return;

			const pageContainer = document.querySelector('.pageContainer');

			if (!(pageContainer instanceof HTMLElement)) return;

			resizeObserver = new ResizeObserver(updateAutoZoom);
			resizeObserver.observe(pageContainer);

			window.addEventListener('resize', updateAutoZoom);

			updateAutoZoom();
		});

		return () => {
			cancelled = true;
			resizeObserver?.disconnect();
			window.removeEventListener('resize', updateAutoZoom);
		};
	});

	/** @type {string | null} */
	let selectedEventId = $state(null);

	const { addPage, addPageAndScroll, duplicatePage, deletePage, deleteLastPage } =
		createPageActions({
			pages,
			createPage,
			generateId,
			getEventImage,
			saveEventImage,
			deleteEventImages,
			history,
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
		getEventImage,
		saveEventImage,
		history,
		getSelectedEventId: () => selectedEventId,
		clearSelectedEvent: () => (selectedEventId = null)
	});

	/**
	 * Met à jour une propriété d'événement et enregistre le changement.
	 *
	 * @template {keyof Event} K
	 * @param {string} eventId
	 * @param {K} field
	 * @param {Event[K]} value
	 * @returns {void}
	 */
	function handleUpdateEvent(eventId, field, value) {
		const event = pages.current
			.flatMap((page) => page.events)
			.find((event) => event.id === eventId);

		if (!event) return;

		const previousValue = event[field];

		recordChange(history, previousValue, value, (nextValue) => {
			updateEvent(eventId, field, nextValue);
		});
	}

	/**
	 * Met à jour une couleur et enregistre le changement dans l'historique.
	 * @param {'bgDate' | 'bgTitle' | 'colorDate' | 'colorTitle' | 'colorContent'} property
	 * @param {string} newValue
	 * @returns {void}
	 */
	function handleUpdateStyle(property, newValue) {
		const previousValue = styles.current[property];

		recordChange(history, previousValue, newValue, (value) => {
			styles.current = {
				...styles.current,
				[property]: value
			};
		});
	}

	/**
	 * Remplace l'image d'un événement et enregistre le changement dans l'historique.
	 * @param {string} eventId
	 * @param {Blob} newImage
	 * @returns {Promise<void>}
	 */
	async function handleImageChange(eventId, newImage) {
		const event = pages.current
			.flatMap((page) => page.events)
			.find((event) => event.id === eventId);

		if (!event) return;

		const previousImage = await getEventImage(eventId);

		/**
		 * Applique une image et déclenche son rechargement.
		 * @param {Blob | null} image
		 * @returns {Promise<void>}
		 */
		async function applyImage(image) {
			if (image) {
				await saveEventImage(eventId, image);
			} else {
				await deleteEventImage(eventId);
			}

			const currentEvent = pages.current
				.flatMap((page) => page.events)
				.find((event) => event.id === eventId);

			if (currentEvent) {
				updateEvent(eventId, 'imageVersion', (currentEvent.imageVersion ?? 0) + 1);
			}
		}

		await applyImage(newImage);

		history.push({
			undo: () => applyImage(previousImage),
			redo: () => applyImage(newImage)
		});
	}

	/** Indique si un groupe de modifications d'événement est ouvert. */
	let isEventEditGroupOpen = false;

	/** Indique si un groupe de modifications de couleur est ouvert. */
	let isColorEditGroupOpen = false;

	/** Commence un groupe de modifications d'un événement. */
	function beginEventEdit() {
		if (isEventEditGroupOpen) return;

		if (!isColorEditGroupOpen) {
			history.beginGroup();
		}

		isEventEditGroupOpen = true;
	}

	/** Termine le groupe de modifications d'un événement. */
	function endEventEdit() {
		if (!isEventEditGroupOpen) return;

		isEventEditGroupOpen = false;

		if (!isColorEditGroupOpen) {
			history.endGroup();
		}
	}

	/** Commence un groupe de modifications de couleur. */
	function beginColorEdit() {
		if (isColorEditGroupOpen) return;

		if (!isEventEditGroupOpen) {
			history.beginGroup();
		}

		isColorEditGroupOpen = true;
	}

	/** Termine le groupe de modifications de couleur. */
	function endColorEdit() {
		if (!isColorEditGroupOpen) return;

		isColorEditGroupOpen = false;

		if (!isEventEditGroupOpen) {
			history.endGroup();
		}
	}

	const { resetEvents, resetAll } = createResetActions({
		pages,
		createPage,
		getEventImage,
		saveEventImage,
		deleteEventImages,
		clearSelectedEvent: () => (selectedEventId = null),
		selectedLibrary,
		selectedMonth,
		styles,
		defaultStyles,
		history
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

	$effect(() => {
		if (!documentReady) return;

		history.clear();
	});

	/**
	 * Annule la dernière action.
	 * @returns {Promise<void>}
	 */
	async function handleUndo() {
		await history.undo();
	}

	/**
	 * Rétablit la dernière action annulée.
	 * @returns {Promise<void>}
	 */
	async function handleRedo() {
		await history.redo();
	}

	/**
	 * Met à jour une propriété du document et enregistre le changement dans l'historique.
	 *
	 * @template {keyof AppDocument} K
	 * @param {K} property
	 * @param {AppDocument[K]} newValue
	 * @returns {boolean}
	 */
	function updateDocumentProperty(property, newValue) {
		if (!activeDocument) return false;

		const previousValue = activeDocument[property];

		if (previousValue === newValue) return true;

		/** @type {Partial<AppDocument>} */
		const previousValues = { [property]: previousValue };

		/** @type {Partial<AppDocument>} */
		const newValues = { [property]: newValue };

		recordChange(history, previousValues, newValues, (values) => {
			if (!activeDocument) return;

			activeDocument = {
				...activeDocument,
				...values
			};
		});

		return true;
	}

	onMount(() => {
		return setupHistoryKeyboard({
			undo: handleUndo,
			redo: handleRedo,
			canUndo: () => historyState.canUndo,
			canRedo: () => historyState.canRedo
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
		onUpdateDocument={updateDocumentProperty}
		onUpdateStyle={handleUpdateStyle}
		onBeginColorEdit={beginColorEdit}
		onEndColorEdit={endColorEdit}
	/>

	<div class="container">
		<EditorToolbar
			canUndo={historyState.canUndo}
			canRedo={historyState.canRedo}
			onUndo={handleUndo}
			onRedo={handleRedo}
		/>
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
			onUpdateEvent={handleUpdateEvent}
			onChangeImage={handleImageChange}
			onBeginEdit={beginEventEdit}
			onEndEdit={endEventEdit}
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
		top: 54px;
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
