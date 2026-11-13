<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */
	/** @typedef {import('#lib/utils/types.js').DocumentUpdates} DocumentUpdates */

	import DocumentsToolbar from '#lib/components/documents-manager/content/DocumentsToolbar.svelte';

	/** @type {{
		documents: AppDocument[],
		createDocument: (options: {
			name: string,
			libraryId: number | null,
			monthId: number | null
		}) => AppDocument,
		updateDocument: (documentId: string, updates: DocumentUpdates) => void,
		deleteDocument: (documentId: string) => void
	}} */
	let { documents, createDocument, updateDocument, deleteDocument } = $props();

	let searchQuery = $state('');
	let sortOrder = $state('updated-desc');

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
</script>

<div class="space-y-6 px-6 py-8">
	<DocumentsToolbar bind:searchQuery bind:sortOrder />
</div>
