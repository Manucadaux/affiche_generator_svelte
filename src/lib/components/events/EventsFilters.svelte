<script>
	import { X, RotateCcw } from '@lucide/svelte';
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
		actionTypeOptions = [],
		onClose,
		onReset
	} = $props();

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
</script>

<div class="flex h-full w-80 flex-col gap-5 pr-2">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold">Filtres et tris</h2>

		<button
			type="button"
			class="btn btn-square btn-ghost btn-sm"
			aria-label="Fermer les filtres"
			title="Fermer"
			onclick={onClose}
		>
			<X size={18} />
		</button>
	</div>

	<div class="divider my-0"></div>

	<div class="flex flex-col gap-4">
		<h3 class="text-sm font-semibold text-base-content/60">Filtrer par</h3>

		<label class="form-control gap-1">
			<span class="label-text">Médiathèque</span>

			<select
				class="select-bordered select w-full select-sm"
				aria-label="Filtrer par médiathèque"
				bind:value={libraryId}
			>
				<option value="all">Toutes les médiathèques</option>

				{#each optionsLibrary as library (library.id)}
					<option value={String(library.id)}>{library.label}</option>
				{/each}
			</select>
		</label>

		<label class="form-control gap-1">
			<span class="label-text">Section</span>

			<select
				class="select-bordered select w-full select-sm"
				aria-label="Filtrer par section"
				bind:value={section}
			>
				<option value="all">Toutes les sections</option>
				<option value="Tout public">Tout public</option>
				<option value="Jeunesse">Jeunesse</option>
				<option value="Adulte">Adulte</option>
			</select>
		</label>

		<label class="form-control gap-1">
			<span class="label-text">Mois</span>

			<select
				class="select-bordered select w-full select-sm"
				aria-label="Filtrer par mois"
				bind:value={month}
			>
				<option value="all">Tous les mois</option>

				{#each months as item (item.value)}
					<option value={item.value}>{item.label}</option>
				{/each}
			</select>
		</label>

		<label class="form-control gap-1">
			<span class="label-text">Année</span>

			<select
				class="select-bordered select w-full select-sm"
				aria-label="Filtrer par année"
				bind:value={year}
			>
				<option value="all">Toutes les années</option>

				{#each years as item (item)}
					<option value={String(item)}>{item}</option>
				{/each}
			</select>
		</label>
	</div>

	<div class="divider my-0"></div>

	<div class="flex flex-col gap-4">
		<h3 class="text-sm font-semibold text-base-content/60">Autres critères</h3>

		<label class="form-control gap-1">
			<span class="label-text">Inscription</span>

			<select class="select-bordered select w-full select-sm" bind:value={inscription}>
				<option value="all">Toutes</option>
				<option value="yes">Avec inscription</option>
				<option value="no">Sans inscription</option>
			</select>
		</label>

		<label class="form-control gap-1">
			<span class="label-text">Genre</span>

			<select class="select-bordered select w-full select-sm" bind:value={genre}>
				<option value="all">Tous</option>

				{#each genreOptions as item (item)}
					<option value={item}>{item}</option>
				{/each}
			</select>
		</label>

		<label class="form-control gap-1">
			<span class="label-text">Type d'action</span>

			<select class="select-bordered select w-full select-sm" bind:value={actionType}>
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

	<div class="divider my-0"></div>

	<button type="button" class="btn w-full btn-outline btn-sm" onclick={onReset}>
		<RotateCcw size={16} />
		Réinitialiser les filtres
	</button>
</div>
