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
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';

	import AppHeader from '#lib/components/layout/AppHeader.svelte';
	import DocumentsContent from '#lib/components/documents-manager/DocumentsContent.svelte';
	import DocumentsFooter from '#lib/components/documents-manager/DocumentsFooter.svelte';

	const selectedLibraryForNewDocument = useLocalStorage('newDocumentLibraryId', null);
	const selectedTheme = useLocalStorage('selectedTheme', 'system');
	applyTheme(selectedTheme);

	/** @type {AppDocument[]} */
	let documents = $state([]);

	let isInitialized = $state(false);
	let initializationError = $state('');

	const { createDocument, updateDocument, deleteDocument, restoreDocument, duplicateDocument } =
		createDocumentActions({
			createPage,
			generateId,
			defaultStyles
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
</script>

<div class="flex min-h-screen flex-col">
	<AppHeader
		title="Gestionnaire d'affiches"
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
				{restoreDocument}
				{duplicateDocument}
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
