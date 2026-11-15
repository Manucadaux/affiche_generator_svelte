<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */

	import CreateDocumentCard from './CreateDocumentCard.svelte';
	import DocumentCard from './DocumentCard.svelte';

	/** @type {{
        documents: AppDocument[],
        optionsLibrary: { id: number, label: string }[],
        optionsMonth: { id: number, label: string }[],
        onCreate: () => void,
        onOpen: (documentId: string) => void,
        onDelete: (documentId: string) => void,
        onDuplicate: (documentId: string) => void,
        onRename: (documentId: string, name: string) => Promise<void>,
    }} */
	let {
		documents,
		optionsLibrary,
		optionsMonth,
		onCreate,
		onOpen,
		onDelete,
		onDuplicate,
		onRename
	} = $props();

	/**
	 * Crée le callback de renommage d'un document.
	 * @param {AppDocument} document
	 * @returns {(name: string) => Promise<void>}
	 */
	function createRenameHandler(document) {
		return (name) => onRename(document.id, name);
	}
</script>

<div class="grid grid-cols-[repeat(auto-fill,220px)] gap-5">
	<CreateDocumentCard {onCreate} />

	{#each documents as document (document.id)}
		{@const libraryName =
			optionsLibrary.find((option) => option.id === document.libraryId)?.label ?? null}

		{@const monthName =
			optionsMonth.find((option) => option.id === document.monthId)?.label ?? null}

		<DocumentCard
			{document}
			{libraryName}
			{monthName}
			onOpen={() => onOpen(document.id)}
			{onDelete}
			{onDuplicate}
			onRename={createRenameHandler(document)}
		/>
	{/each}
</div>
