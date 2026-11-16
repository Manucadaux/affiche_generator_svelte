<script>
	import { Trash2 } from 'lucide-svelte';
	import { deleteDatabase } from '#lib/utils/indexedDB.js';

	/**
	 * @returns {Promise<void>}
	 */
	async function clearStorage() {
		const confirmed = window.confirm(
			'Attention : toutes les données locales (LocalStorage et IndexedDB) seront supprimées. Continuer ?'
		);

		if (!confirmed) return;

		try {
			await deleteDatabase();
			localStorage.clear();

			window.location.reload();
		} catch (error) {
			console.error('Erreur lors de la suppression des données :', error);
			window.alert('Une erreur est survenue lors de la suppression des données.');
		}
	}
</script>

{#if import.meta.env.DEV}
	<button
		type="button"
		class="btn fixed right-5 bottom-5 z-9999 btn-circle shadow-lg btn-error"
		title="Effacer toutes les données locales"
		aria-label="Effacer toutes les données locales"
		onclick={clearStorage}
	>
		<Trash2 size={22} />
	</button>
{/if}
