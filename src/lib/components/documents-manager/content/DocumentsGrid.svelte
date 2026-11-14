<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */

	import { Plus } from 'lucide-svelte';
	import DocumentCard from './DocumentCard.svelte';

	/** @type {{
		documents: AppDocument[],
		onCreate: () => void,
		onOpen: (documentId: string) => void
	}} */
	let { documents, onCreate, onOpen } = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,220px)] gap-5">
	<button
		type="button"
		class="flex h-72.5 w-55 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-base-300 bg-base-100 text-base-content/60"
		onclick={onCreate}
	>
		<div class="flex size-12 items-center justify-center rounded-full bg-base-200">
			<Plus size={24} />
		</div>

		<span class="font-medium">Créer un document</span>
	</button>

	{#each documents as document (document.id)}
		<DocumentCard {document} onOpen={() => onOpen(document.id)} />
	{/each}
</div>
