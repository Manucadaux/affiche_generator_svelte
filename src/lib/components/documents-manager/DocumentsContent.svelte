<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */
	/** @typedef {import('#lib/utils/types.js').DocumentUpdates} DocumentUpdates */
	/** @typedef {import('#lib/utils/types.js').Styles} Styles */

	import DocumentsToolbar from '#lib/components/documents-manager/content/DocumentsToolbar.svelte';
	import DocumentsGrid from '#lib/components/documents-manager/content/DocumentsGrid.svelte';
	import EmptyDocuments from '#lib/components/documents-manager/content/EmptyDocuments.svelte';
	import NewDocumentModal from '#lib/components/documents-manager/content/NewDocumentModal.svelte';

	/**
	 * @typedef {Object} NewDocumentOptions
	 * @property {string} name
	 * @property {number | null} libraryId
	 * @property {number | null} monthId
	 * @property {Styles} styles
	 */

	/** @type {{
		documents: AppDocument[],
		createDocument: (options: NewDocumentOptions) => AppDocument,
		updateDocument: (documentId: string, updates: DocumentUpdates) => void,
		deleteDocument: (documentId: string) => void,
		defaultLibraryId: number | null,
		defaultStyles: Styles,
		optionsLibrary: { id: number, label: string }[],
		optionsMonth: { id: number, label: string }[]
	}} */
	let {
		documents,
		createDocument,
		updateDocument,
		deleteDocument,
		defaultLibraryId,
		defaultStyles,
		optionsLibrary,
		optionsMonth
	} = $props();

	let searchQuery = $state('');
	let sortOrder = $state('updated-desc');
	let isCreateModalOpen = $state(false);

	let filteredDocuments = $derived.by(() => {
		const query = searchQuery.trim().toLocaleLowerCase('fr');

		const filtered = documents.filter((document) =>
			document.name.toLocaleLowerCase('fr').includes(query)
		);

		return [...filtered].sort((a, b) => {
			switch (sortOrder) {
				case 'updated-asc':
					return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
				case 'name-asc':
					return a.name.localeCompare(b.name, 'fr');
				case 'name-desc':
					return b.name.localeCompare(a.name, 'fr');
				case 'updated-desc':
				default:
					return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
			}
		});
	});

	/**
	 * Crée un document puis ferme la modale.
	 * @param {NewDocumentOptions} options
	 * @returns {void}
	 */
	function handleCreateDocument(options) {
		createDocument(options);
		isCreateModalOpen = false;
	}
</script>

{#if documents.length === 0}
	<EmptyDocuments onCreate={() => (isCreateModalOpen = true)} />
{:else}
	<div class="space-y-6 px-6 py-8">
		<DocumentsToolbar bind:searchQuery bind:sortOrder />

		{#if filteredDocuments.length > 0}
			<DocumentsGrid documents={filteredDocuments} onCreate={() => (isCreateModalOpen = true)} />
		{:else}
			<p class="py-12 text-center text-sm text-base-content/60">
				Aucun document ne correspond à ta recherche.
			</p>
		{/if}
	</div>
{/if}

{#if isCreateModalOpen}
	<NewDocumentModal
		{documents}
		{defaultLibraryId}
		{defaultStyles}
		{optionsLibrary}
		{optionsMonth}
		onClose={() => (isCreateModalOpen = false)}
		onCreate={handleCreateDocument}
	/>
{/if}
