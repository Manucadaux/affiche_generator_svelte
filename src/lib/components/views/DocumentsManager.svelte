<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */

	import { onMount } from 'svelte';

	import { optionsLibrary, optionsMonth, defaultStyles } from '#lib/data/options.js';
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { createPage, generateId } from '#lib/utils/factories.js';
	import { createDocumentActions } from '#lib/utils/documentActions.js';
	import { initializeDocuments } from '#lib/utils/initializeDocuments.js';
	import { getAllDocuments } from '#lib/utils/documentStorage.js';
	import { subscribeToDocumentChanges } from '#lib/utils/documentSync.js';

	import DocumentsHeader from '#lib/components/documents-manager/DocumentsHeader.svelte';
	import DocumentsContent from '#lib/components/documents-manager/DocumentsContent.svelte';
	import DocumentsFooter from '#lib/components/documents-manager/DocumentsFooter.svelte';

	const selectedLibraryForNewDocument = useLocalStorage('newDocumentLibraryId', null);
	const selectedTheme = useLocalStorage('selectedTheme', 'system');

	/** @type {AppDocument[]} */
	let documents = $state([]);

	let isInitialized = $state(false);
	let initializationError = $state('');

	const { createDocument, getDocument, updateDocument, deleteDocument } = createDocumentActions({
		createPage,
		generateId,
		defaultStyles
	});

	let systemPrefersDark = $state(false);

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

	/**
	 * Recharge la liste des documents depuis IndexedDB.
	 * @returns {Promise<void>}
	 */
	async function refreshDocuments() {
		documents = await getAllDocuments();
	}

	onMount(async () => {
		try {
			await initializeDocuments();
			await refreshDocuments();
			isInitialized = true;
		} catch (error) {
			console.error("Erreur lors de l'initialisation des documents :", error);
			initializationError = 'Impossible de charger les documents.';
		}
	});

	onMount(() => {
		return subscribeToDocumentChanges(() => {
			refreshDocuments().catch((error) => {
				console.error('Erreur lors de la synchronisation des documents :', error);
			});
		});
	});

	$effect(() => {
		if (!selectedTheme.ready) return;

		const theme =
			selectedTheme.current === 'system'
				? systemPrefersDark
					? 'dark'
					: 'light'
				: selectedTheme.current;

		document.documentElement.setAttribute('data-theme', theme);
	});
</script>

<div class="flex min-h-screen flex-col">
	<DocumentsHeader
		{optionsLibrary}
		bind:selectedLibrary={selectedLibraryForNewDocument.current}
		bind:selectedTheme={selectedTheme.current}
	/>

	<main class="flex-1">
		{#if initializationError}
			<p class="p-8 text-center text-error">{initializationError}</p>
		{:else if isInitialized}
			<DocumentsContent
				{documents}
				{createDocument}
				{updateDocument}
				{deleteDocument}
				{refreshDocuments}
				defaultLibraryId={selectedLibraryForNewDocument.current}
				{defaultStyles}
				{optionsLibrary}
				{optionsMonth}
			/>
		{/if}
	</main>

	<DocumentsFooter />
</div>
