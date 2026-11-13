<script>
	import { FilePlusCorner } from 'lucide-svelte';

	/** @type {{ onCreate: () => void }} */
	let { onCreate } = $props();
</script>

<div class="flex flex-col items-center justify-center gap-4 py-20 text-center">
	<div class="flex size-20 items-center justify-center rounded-2xl bg-base-200">
		<FilePlusCorner size={40} strokeWidth={1.2} class="text-base-content/50" />
	</div>

	<div class="space-y-2">
		<h2 class="text-xl font-semibold">Aucun document pour le moment</h2>
		<p class="max-w-md text-sm text-base-content/60">
			Crée ton premier document pour commencer à préparer les affiches d'animations.
		</p>
	</div>

	<button
		type="button"
		class="flex items-center gap-2 rounded-lg border border-dashed border-base-300 px-5 py-3 font-medium text-base-content/60"
		onclick={onCreate}
	>
		<FilePlusCorner size={18} />
		Créer un document
	</button>
</div>
