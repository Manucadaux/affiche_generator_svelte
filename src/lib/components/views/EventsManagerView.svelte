<script>
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';

	import AppHeader from '#lib/components/layout/AppHeader.svelte';
	import AppFooter from '#lib/components/layout/AppFooter.svelte';
	import EmptyEvents from '#lib/components/events/EmptyEvents.svelte';
	import NewEventModal from '#lib/components/events/NewEventModal.svelte';

	const selectedTheme = useLocalStorage('selectedTheme', 'system');
	applyTheme(selectedTheme);

	let isNewEventModalOpen = $state(false);

	/** @param {Omit<import('#lib/utils/types.js').ManagedEvent, 'id' | 'createdAt' | 'updatedAt'>} eventData */
	function handleCreate(eventData) {
		console.log('Événement à créer :', eventData);
		isNewEventModalOpen = false;
	}
</script>

<div class="flex min-h-screen flex-col">
	<AppHeader title="Gestionnaire d'événements" bind:selectedTheme={selectedTheme.current} />

	<main class="flex flex-1 flex-col items-center justify-center px-6 text-center">
		<EmptyEvents onOpenCreate={() => (isNewEventModalOpen = true)} />
	</main>

	{#if isNewEventModalOpen}
		<NewEventModal onClose={() => (isNewEventModalOpen = false)} onCreate={handleCreate} />
	{/if}

	<AppFooter />
</div>
