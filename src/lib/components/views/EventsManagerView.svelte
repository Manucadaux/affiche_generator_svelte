<script>
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';
	import AppHeader from '#lib/components/layout/AppHeader.svelte';
	import AppFooter from '#lib/components/layout/AppFooter.svelte';
	import { CalendarPlus } from 'lucide-svelte';

	const selectedTheme = useLocalStorage('selectedTheme', 'system');
	applyTheme(selectedTheme);
</script>

<div class="flex min-h-screen flex-col">
	<AppHeader title="Gestionnaire d'événements" bind:selectedTheme={selectedTheme.current} />

	<main class="flex flex-1 flex-col items-center justify-center px-6 text-center">
		<div
			class="mb-6 flex size-20 items-center justify-center rounded-full bg-base-200 text-base-content/50"
		>
			<CalendarPlus size={36} />
		</div>

		<h1 class="text-2xl font-semibold">Aucun événement pour le moment</h1>

		<p class="mt-3 max-w-md text-base-content/60">
			Créez votre premier événement pour commencer à organiser les animations de votre médiathèque.
		</p>

		<button type="button" class="btn mt-6 cursor-pointer btn-primary"> Créer un événement </button>
	</main>

	<AppFooter />
</div>
