<script>
	import { Palette, ChevronDown } from 'lucide-svelte';
	let {
		nbPages,
		addPage,
		optionsLibrary,
		optionsMonth,
		selectedLibrary = $bindable(),
		selectedMonth = $bindable(),
		styles = $bindable()
	} = $props();

	const themes = [
		{ label: 'Light', value: 'light' },
		{ label: 'Dark', value: 'dark' },
		{ label: 'Cupcake', value: 'cupcake' },
		{ label: 'Retro', value: 'retro' },
		{ label: 'Cyberpunk', value: 'cyberpunk' },
		{ label: 'Valentine', value: 'valentine' },
		{ label: 'Aqua', value: 'aqua' }
	];
</script>

<div class="generatorOptions">
	<div class="generalHeader">
		<h3>Général</h3>

		<div class="dropdown dropdown-end">
			<button tabindex="0" class="btn btn-neutral btn-sm" aria-label="Choisir un thème">
				<Palette size={18} />
				<ChevronDown size={14} />
			</button>

			<ul
				tabindex="-1"
				class="dropdown-content z-50 w-48 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
			>
				<li class="menu-title">Choisir un thème</li>

				{#each themes as theme (theme.value)}
					<li>
						<input
							type="radio"
							name="theme-dropdown"
							class="theme-controller btn btn-block justify-start btn-ghost btn-sm"
							aria-label={theme.label}
							value={theme.value}
						/>
					</li>
				{/each}
			</ul>
		</div>
	</div>
	<div class="zoomControl">
		<label for="zoom">
			Zoom de l'affiche : <strong>{styles.zoom}%</strong>
		</label>

		<input
			id="zoom"
			type="range"
			min="30"
			max="100"
			step="5"
			value={styles.zoom}
			oninput={(e) => (styles.zoom = Number(e.currentTarget.value))}
			class="range range-primary"
		/>
	</div>
	<div>
		<button onclick={addPage} class="btn btn-block btn-neutral">
			Ajouter page {nbPages + 1}
		</button>
	</div>

	<div>
		<label for="libraries">Sélectionnez une médiathèque</label>
		<select id="libraries" class="select" bind:value={selectedLibrary}>
			{#each optionsLibrary as option (option.id)}
				<option value={option.id}>{option.label}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="months">Sélectionnez un mois</label>
		<select id="months" class="select" bind:value={selectedMonth}>
			{#each optionsMonth as option (option.id)}
				<option value={option.id}>{option.label}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.generatorOptions > div {
		margin: 25px 0;
	}

	.generalHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;
		overflow: visible;
	}

	.generalHeader h3 {
		margin: 0;
	}

	.dropdown {
		position: relative;
	}
</style>
