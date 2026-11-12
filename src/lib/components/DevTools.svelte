<script>
	import { Trash2 } from 'lucide-svelte';

	function clearStorage() {
		const confirmed = window.confirm(
			'Attention : toutes les données du stockage local seront supprimées. Continuer ?'
		);

		if (!confirmed) return;

		localStorage.clear();
		window.location.reload();
	}
</script>

{#if import.meta.env.DEV}
	<button
		type="button"
		class="btn fixed right-5 bottom-5 z-9999 btn-circle shadow-lg btn-error"
		title="Effacer tout le LocalStorage"
		aria-label="Effacer tout le LocalStorage"
		onclick={clearStorage}
	>
		<Trash2 size={22} />
	</button>
{/if}
