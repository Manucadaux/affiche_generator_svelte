<script>
	import { Search, Plus, SlidersHorizontal } from '@lucide/svelte';

	let {
		eventCount = 0,
		searchQuery = $bindable(''),
		filtersOpen = $bindable(false),
		libraryId = 'all',
		section = 'all',
		month = 'all',
		year = 'all',
		inscription = 'all',
		genre = 'all',
		actionType = 'all',
		incomplete = false,
		onCreate
	} = $props();

	let activeFilters = $derived(
		[
			libraryId !== 'all',
			section !== 'all',
			month !== 'all',
			year !== 'all',
			inscription !== 'all',
			genre !== 'all',
			actionType !== 'all',
			incomplete
		].filter(Boolean).length
	);
</script>

<div class="flex items-center justify-between gap-4">
	<div class="flex min-w-0 flex-1 items-center gap-4">
		<p class="shrink-0 text-sm text-base-content/60">
			{eventCount}
			{eventCount === 1 ? 'événement' : 'événements'}
		</p>

		<label class="input-bordered input flex w-full max-w-md items-center gap-2 input-sm">
			<Search size={16} class="text-base-content/50" />

			<input
				type="search"
				class="grow"
				placeholder="Rechercher un événement"
				aria-label="Rechercher un événement"
				bind:value={searchQuery}
			/>
		</label>
	</div>

	<div class="flex shrink-0 items-center gap-2">
		<button
			type="button"
			class="btn btn-outline btn-sm"
			aria-expanded={filtersOpen}
			aria-controls="events-filters-panel"
			onclick={() => (filtersOpen = !filtersOpen)}
		>
			<SlidersHorizontal size={16} />
			Filtres et tris

			{#if activeFilters > 0}
				<span class="badge badge-sm badge-primary">{activeFilters}</span>
			{/if}
		</button>

		<button type="button" class="btn btn-primary btn-sm" onclick={onCreate}>
			<Plus size={16} />
			Créer un événement
		</button>
	</div>
</div>
