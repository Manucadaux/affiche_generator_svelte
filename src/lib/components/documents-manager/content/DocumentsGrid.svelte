<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */

	import { Plus } from 'lucide-svelte';
	import CreateDocumentCard from './CreateDocumentCard.svelte';
	import DocumentCard from './DocumentCard.svelte';

	/** @type {{
		documents: AppDocument[],
		onCreate: () => void,
		onOpen: (documentId: string) => void,
		optionsLibrary: { id: number, label: string }[],
		optionsMonth: { id: number, label: string }[]
	}} */
	let { documents, onCreate, onOpen, optionsLibrary, optionsMonth } = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,220px)] gap-5">
	<CreateDocumentCard {onCreate} />

	{#each documents as document (document.id)}
		{@const libraryName =
			optionsLibrary.find((option) => option.id === document.libraryId)?.label ?? null}

		{@const monthName =
			optionsMonth.find((option) => option.id === document.monthId)?.label ?? null}

		<DocumentCard {document} {libraryName} {monthName} onOpen={() => onOpen(document.id)} />
	{/each}
</div>
