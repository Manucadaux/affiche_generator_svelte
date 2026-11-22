
<script>
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';

	import AppHeader from '#lib/components/layout/AppHeader.svelte';
	import AppFooter from '#lib/components/layout/AppFooter.svelte';
	import EmptyEvents from '#lib/components/events/EmptyEvents.svelte';

	const selectedTheme = useLocalStorage('selectedTheme', 'system');
	applyTheme(selectedTheme);

	/** @type {import('#lib/utils/types.js').ManagedEvent[]} */
	let events = $state([]);

	let isEditMode = $state(false);

	function handleStartEditing() {
		isEditMode = true;
	}
</script>

<div class="flex min-h-screen flex-col">
	<AppHeader title="Gestionnaire d'événements" bind:selectedTheme={selectedTheme.current} />

	<main
		class="flex flex-1 flex-col items-center justify-center px-6 text-center"
		data-mode={isEditMode ? 'edit' : 'read'}
	>
		{#if events.length === 0}
			<EmptyEvents onOpenCreate={handleStartEditing} />
		{:else}
			<!-- La liste des événements sera intégrée ici. -->
		{/if}
	</main>

	<AppFooter />
</div>
