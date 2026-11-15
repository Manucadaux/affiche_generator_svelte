<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */
	/** @typedef {import('#lib/utils/types.js').DocumentUpdates} DocumentUpdates */
	/** @typedef {import('#lib/utils/types.js').Styles} Styles */

	import DocumentsToolbar from '#lib/components/documents-manager/content/DocumentsToolbar.svelte';
	import DocumentsGrid from '#lib/components/documents-manager/content/DocumentsGrid.svelte';
	import EmptyDocuments from '#lib/components/documents-manager/content/EmptyDocuments.svelte';
	import NewDocumentModal from '#lib/components/documents-manager/content/NewDocumentModal.svelte';
	import DeleteModal from '#lib/components/ui/DeleteModal.svelte';
	import Toast from '#lib/components/ui/Toast.svelte';

	/**
	 * @typedef {Object} NewDocumentOptions
	 * @property {string} name
	 * @property {number | null} libraryId
	 * @property {number | null} monthId
	 * @property {Styles} styles
	 */

	/** @type {{
		documents: AppDocument[],
		createDocument: (options: NewDocumentOptions) => Promise<AppDocument>,
		updateDocument: (documentId: string, updates: DocumentUpdates) => Promise<void>,
		deleteDocument: (documentId: string) => Promise<void>,
		duplicateDocument: (documentId: string) => Promise<AppDocument | null>,
		refreshDocuments: () => Promise<void>,
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
		duplicateDocument,
		refreshDocuments,
		defaultLibraryId,
		defaultStyles,
		optionsLibrary,
		optionsMonth
	} = $props();

	let searchQuery = $state('');
	let sortOrder = $state('updated-desc');
	let isCreateModalOpen = $state(false);
	/** @type {AppDocument | null} */
	let documentToDelete = $state(null);

	let toastMessage = $state('');
	/** @type {'success' | 'error' | 'info' | 'warning'} */
	let toastType = $state('error');

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
	 * Ouvre l'éditeur d'un document dans un nouvel onglet.
	 * @param {string} documentId
	 * @returns {void}
	 */
	function openDocumentInNewTab(documentId) {
		window.open(
			`/document-editor?documentId=${encodeURIComponent(documentId)}`,
			'_blank',
			'noopener,noreferrer'
		);
	}

	/**
	 * Crée un document puis ouvre son éditeur dans un nouvel onglet.
	 * @param {NewDocumentOptions} options
	 * @returns {Promise<void>}
	 */
	async function handleCreateDocument(options) {
		const editorTab = window.open('about:blank', '_blank');

		if (editorTab) {
			editorTab.opener = null;
		}

		try {
			const newDocument = await createDocument(options);

			await refreshDocuments();

			isCreateModalOpen = false;

			if (editorTab) {
				editorTab.location.href = `/document-editor?documentId=${encodeURIComponent(newDocument.id)}`;
			}
		} catch (error) {
			editorTab?.close();
			console.error('Erreur lors de la création du document :', error);
		}
	}

	/**
	 * Ouvre l'éditeur du document sélectionné dans un nouvel onglet.
	 * @param {string} documentId
	 * @returns {void}
	 */
	function handleOpenDocument(documentId) {
		openDocumentInNewTab(documentId);
	}

	/**
	 * Ouvre la confirmation de suppression d'un document.
	 * @param {string} documentId
	 * @returns {void}
	 */
	function handleDeleteRequest(documentId) {
		documentToDelete = documents.find((document) => document.id === documentId) ?? null;
	}

	/**
	 * Supprime le document après confirmation.
	 * @returns {Promise<void>}
	 */
	async function handleConfirmDelete() {
		if (!documentToDelete) return;

		try {
			await deleteDocument(documentToDelete.id);
			await refreshDocuments();
			documentToDelete = null;
		} catch (error) {
			console.error('Erreur lors de la suppression du document :', error);
		}
	}

	/**
	 * Duplique un document.
	 * @param {string} documentId
	 * @returns {Promise<void>}
	 */
	async function handleDuplicateDocument(documentId) {
		try {
			await duplicateDocument(documentId);
			await refreshDocuments();
		} catch (error) {
			console.error('Erreur lors de la duplication du document :', error);
		}
	}

	/**
	 * Renomme un document.
	 * @param {string} documentId
	 * @param {string} name
	 * @returns {Promise<boolean>}
	 */
	async function handleRenameDocument(documentId, name) {
		try {
			await updateDocument(documentId, { name });
			await refreshDocuments();

			return true;
		} catch (error) {
			console.error('Erreur lors du renommage du document :', error);

			toastType = 'error';
			toastMessage = 'Impossible de renommer le document. Veuillez réessayer.';

			return false;
		}
	}
</script>

{#if documents.length === 0}
	<EmptyDocuments onCreate={() => (isCreateModalOpen = true)} />
{:else}
	<div class="space-y-6 px-6 py-8">
		<DocumentsToolbar bind:searchQuery bind:sortOrder />

		{#if filteredDocuments.length > 0}
			<DocumentsGrid
				documents={filteredDocuments}
				{optionsLibrary}
				{optionsMonth}
				onCreate={() => (isCreateModalOpen = true)}
				onOpen={handleOpenDocument}
				onDelete={handleDeleteRequest}
				onDuplicate={handleDuplicateDocument}
				onRename={handleRenameDocument}
			/>
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

{#if documentToDelete}
	<DeleteModal
		title="Supprimer le document"
		itemName={documentToDelete.name}
		message="Cette action est irréversible."
		onClose={() => (documentToDelete = null)}
		onConfirm={handleConfirmDelete}
	/>
{/if}

{#if toastMessage}
	<Toast message={toastMessage} type={toastType} onClose={() => (toastMessage = '')} />
{/if}
