<script>
	import { Plus } from 'lucide-svelte';

	/** @type {{ onCreate: () => void }} */
	let { onCreate } = $props();
</script>

<button
	type="button"
	class="flex h-72.5 w-55 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-base-300 bg-base-100 text-base-content/60 transition hover:bg-base-200"
	onclick={onCreate}
>
	<div class="flex size-12 items-center justify-center rounded-full bg-base-200">
		<Plus size={24} />
	</div>

	<span class="font-medium">Créer un document</span>
</button>
