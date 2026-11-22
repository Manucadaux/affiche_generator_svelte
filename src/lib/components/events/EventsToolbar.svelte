<script>
	import { Search } from '@lucide/svelte';
	import EventsFilters from '#lib/components/events/EventsFilters.svelte';

	let {
		eventCount = 0,
		searchQuery = $bindable(''),
		libraryId = $bindable('all'),
		section = $bindable('all'),
		month = $bindable('all'),
		year = $bindable('all'),
		inscription = $bindable('all'),
		genre = $bindable('all'),
		actionType = $bindable('all'),
		incomplete = $bindable(false),
		genreOptions = [],
		actionTypeOptions = [],
		isEditMode = false,
		onToggleEdit
	} = $props();
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<p class="text-sm text-base-content/60">
			{eventCount}
			{eventCount === 1 ? 'événement' : 'événements'}
		</p>

		<button type="button" class="btn btn-outline btn-sm" onclick={onToggleEdit}>
			{isEditMode ? 'Terminer' : 'Modifier'}
		</button>
	</div>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
		<label class="input-bordered input flex w-full items-center gap-2 input-sm sm:max-w-md">
			<Search size={16} class="text-base-content/50" />

			<input
				type="search"
				class="grow"
				placeholder="Rechercher un événement"
				aria-label="Rechercher un événement"
				bind:value={searchQuery}
			/>
		</label>

		<EventsFilters
			bind:libraryId
			bind:section
			bind:month
			bind:year
			bind:inscription
			bind:genre
			bind:actionType
			bind:incomplete
			{genreOptions}
			{actionTypeOptions}
		/>
	</div>
</div>
