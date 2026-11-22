<script>
	import { FilePlusCorner } from '@lucide/svelte';

	/** @type {{ onCreate: () => void }} */
	let { onCreate } = $props();
</script>

<div class="flex flex-1 flex-col items-center justify-center px-6 text-center">
	<div
		class="mb-6 flex size-20 items-center justify-center rounded-full bg-base-200 text-base-content/50"
	>
		<FilePlusCorner size={36} />
	</div>

	<h2 class="text-2xl font-semibold">Aucun document pour le moment</h2>

	<p class="mt-3 max-w-md text-base-content/60">
		Créez votre premier document pour commencer à préparer les affiches d'animations.
	</p>

	<button type="button" class="btn mt-6 cursor-pointer btn-primary" onclick={onCreate}>
		Créer un document
	</button>
</div>
