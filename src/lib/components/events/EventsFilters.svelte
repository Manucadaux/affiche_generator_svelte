<script>
	import { X } from '@lucide/svelte';
	import { optionsLibrary } from '#lib/data/options.js';

	let {
		libraryId = $bindable('all'),
		section = $bindable('all'),
		month = $bindable('all'),
		year = $bindable('all'),
		inscription = $bindable('all'),
		genre = $bindable('all'),
		actionType = $bindable('all'),
		incomplete = $bindable(false),
		genreOptions = [],
		actionTypeOptions = []
	} = $props();

	let isFiltersOpen = $state(false);

	const months = [
		{ value: '01', label: 'Janvier' },
		{ value: '02', label: 'Février' },
		{ value: '03', label: 'Mars' },
		{ value: '04', label: 'Avril' },
		{ value: '05', label: 'Mai' },
		{ value: '06', label: 'Juin' },
		{ value: '07', label: 'Juillet' },
		{ value: '08', label: 'Août' },
		{ value: '09', label: 'Septembre' },
		{ value: '10', label: 'Octobre' },
		{ value: '11', label: 'Novembre' },
		{ value: '12', label: 'Décembre' }
	];

	const currentYear = new Date().getFullYear();

	const years = Array.from({ length: 11 }, (_, index) => currentYear - 5 + index);

	let activeSecondaryFilters = $derived(
		[inscription !== 'all', genre !== 'all', actionType !== 'all', incomplete].filter(Boolean)
			.length
	);

	/**
	 * Fermer le menu si l'utilisateur clique à l'extérieur.
	 * @param {MouseEvent} event
	 */
	function handleWindowClick(event) {
		if (!(event.target instanceof Element)) return;

		if (!event.target.closest('.filters-dropdown')) {
			isFiltersOpen = false;
		}
	}
</script>

<div class="flex flex-wrap items-center gap-3">
	<label class="flex items-center gap-2">
		<span class="text-sm text-base-content/60">Médiathèque</span>

		<select
			class="select-bordered select select-sm"
			aria-label="Filtrer par médiathèque"
			bind:value={libraryId}
		>
			<option value="all">Toutes</option>

			{#each optionsLibrary as library (library.id)}
				<option value={String(library.id)}>{library.label}</option>
			{/each}
		</select>
	</label>

	<label class="flex items-center gap-2">
		<span class="text-sm text-base-content/60">Section</span>

		<select
			class="select-bordered select select-sm"
			aria-label="Filtrer par section"
			bind:value={section}
		>
			<option value="all">Toutes</option>
			<option value="Tout public">Tout public</option>
			<option value="Jeunesse">Jeunesse</option>
			<option value="Adulte">Adulte</option>
		</select>
	</label>

	<label class="flex items-center gap-2">
		<span class="text-sm text-base-content/60">Mois</span>

		<select
			class="select-bordered select select-sm"
			aria-label="Filtrer par mois"
			bind:value={month}
		>
			<option value="all">Tous</option>

			{#each months as item (item.value)}
				<option value={item.value}>{item.label}</option>
			{/each}
		</select>
	</label>

	<label class="flex items-center gap-2">
		<span class="text-sm text-base-content/60">Année</span>

		<select
			class="select-bordered select select-sm"
			aria-label="Filtrer par année"
			bind:value={year}
		>
			<option value="all">Toutes</option>

			{#each years as item (item)}
				<option value={String(item)}>{item}</option>
			{/each}
		</select>
	</label>

	<div class="filters-dropdown dropdown dropdown-end" class:dropdown-open={isFiltersOpen}>
		<button
			type="button"
			class="btn gap-2 btn-outline btn-sm"
			aria-expanded={isFiltersOpen}
			onclick={(event) => {
				event.stopPropagation();
				isFiltersOpen = !isFiltersOpen;
			}}
		>
			Autres filtres

			{#if activeSecondaryFilters > 0}
				<span class="badge badge-sm badge-primary">
					{activeSecondaryFilters}
				</span>
			{/if}
		</button>

		{#if isFiltersOpen}
			<div
				class="dropdown-content filters-dropdown z-10 mt-2 w-72 rounded-box border border-base-300 bg-base-100 p-4 shadow-lg"
			>
				<div class="mb-4 flex items-center justify-between">
					<h3 class="font-semibold">Autres filtres</h3>

					<button
						type="button"
						class="btn btn-square btn-ghost btn-xs"
						aria-label="Fermer les filtres"
						onclick={() => (isFiltersOpen = false)}
					>
						<X size={16} />
					</button>
				</div>

				<div class="flex flex-col gap-4">
					<label class="form-control gap-1">
						<span class="label-text">Inscription</span>

						<select class="select-bordered select select-sm" bind:value={inscription}>
							<option value="all">Toutes</option>
							<option value="yes">Avec inscription</option>
							<option value="no">Sans inscription</option>
						</select>
					</label>

					<label class="form-control gap-1">
						<span class="label-text">Genre</span>

						<select class="select-bordered select select-sm" bind:value={genre}>
							<option value="all">Tous</option>

							{#each genreOptions as item (item)}
								<option value={item}>{item}</option>
							{/each}
						</select>
					</label>

					<label class="form-control gap-1">
						<span class="label-text">Type d'action</span>

						<select class="select-bordered select select-sm" bind:value={actionType}>
							<option value="all">Tous</option>

							{#each actionTypeOptions as item (item)}
								<option value={item}>{item}</option>
							{/each}
						</select>
					</label>

					<label class="flex cursor-pointer items-center gap-3">
						<input type="checkbox" class="checkbox checkbox-sm" bind:checked={incomplete} />
						<span class="label-text">Informations manquantes</span>
					</label>
				</div>
			</div>
		{/if}
	</div>
</div>

<svelte:window onclick={handleWindowClick} />
