<script>
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';

	import AppHeader from '#lib/components/layout/AppHeader.svelte';
	import AppFooter from '#lib/components/layout/AppFooter.svelte';
	import EmptyEvents from '#lib/components/events/EmptyEvents.svelte';
	import EventsToolbar from '#lib/components/events/EventsToolbar.svelte';

	const selectedTheme = useLocalStorage('selectedTheme', 'system');

	applyTheme(selectedTheme);

	/** @type {import('#lib/utils/types.js').ManagedEvent[]} */
	let events = $state([]);

	let isEditMode = $state(false);

	let searchQuery = $state('');
	let selectedLibraryId = $state('all');
	let selectedSection = $state('all');
	let selectedMonth = $state('all');
	let selectedYear = $state('all');
	let selectedInscription = $state('all');
	let selectedGenre = $state('all');
	let selectedActionType = $state('all');
	let showIncompleteOnly = $state(false);

	function handleStartEditing() {
		isEditMode = true;
	}

	function handleToggleEdit() {
		isEditMode = !isEditMode;
	}

	let genreOptions = $derived(
		[...new Set(events.map((event) => event.genre.trim()).filter(Boolean))].sort()
	);

	let actionTypeOptions = $derived(
		[...new Set(events.map((event) => event.actionType.trim()).filter(Boolean))].sort()
	);
</script>

<div class="flex min-h-screen flex-col">
	<AppHeader title="Gestionnaire d'événements" bind:selectedTheme={selectedTheme.current} />

	<main
		class="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
		data-mode={isEditMode ? 'edit' : 'read'}
	>
		<EventsToolbar
			eventCount={events.length}
			bind:searchQuery
			bind:libraryId={selectedLibraryId}
			bind:section={selectedSection}
			bind:month={selectedMonth}
			bind:year={selectedYear}
			bind:inscription={selectedInscription}
			bind:genre={selectedGenre}
			bind:actionType={selectedActionType}
			bind:incomplete={showIncompleteOnly}
			{genreOptions}
			{actionTypeOptions}
			{isEditMode}
			onToggleEdit={handleToggleEdit}
		/>

		<section class="flex flex-col gap-4" aria-label="Recherche et commandes des événements">
			<!-- À intégrer : recherche, filtres et commandes -->
		</section>

		<!-- Zone principale : liste ou état vide -->
		<section class="flex flex-1 flex-col" aria-label="Liste des événements">
			{#if events.length === 0}
				<div class="flex flex-1 items-center justify-center">
					<EmptyEvents onOpenCreate={handleStartEditing} />
				</div>
			{:else}
				<!-- La liste des événements sera intégrée ici. -->
			{/if}
		</section>
	</main>

	<AppFooter />
</div>
