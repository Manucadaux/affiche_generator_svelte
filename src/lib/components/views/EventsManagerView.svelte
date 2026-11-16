<script>
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';
	import AppHeader from '#lib/components/layout/AppHeader.svelte';
	import AppFooter from '#lib/components/layout/AppFooter.svelte';
	import EmptyEvents from '#lib/components/events/EmptyEvents.svelte';
	import { CalendarPlus } from 'lucide-svelte';

	const selectedTheme = useLocalStorage('selectedTheme', 'system');
	applyTheme(selectedTheme);
</script>

<div class="flex min-h-screen flex-col">
	<AppHeader title="Gestionnaire d'événements" bind:selectedTheme={selectedTheme.current} />

	<main class="flex flex-1 flex-col items-center justify-center px-6 text-center">
		<main class="flex flex-1 flex-col">
			<EmptyEvents />
		</main>
	</main>

	<AppFooter />
</div>
