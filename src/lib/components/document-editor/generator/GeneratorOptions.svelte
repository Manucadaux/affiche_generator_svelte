<script>
	let {
		optionsLibrary,
		optionsMonth,
		selectedLibrary = $bindable(),
		selectedMonth = $bindable(),
		styles = $bindable()
	} = $props();
</script>

<div class="generatorOptions">
	<div class="zoomControl">
		<label for="zoom">
			Zoom de l'affiche : <strong>{styles.zoom}%</strong>
		</label>

		<input
			id="zoom"
			type="range"
			min="30"
			max="100"
			step="1"
			value={styles.zoom}
			oninput={(e) => (styles.zoom = Number(e.currentTarget.value))}
			class="range range-primary"
		/>
	</div>

	<div class="collapse-arrow collapse rounded-box border border-base-content/20">
		<input type="checkbox" checked />

		<div class="collapse-title font-medium">Informations</div>

		<div class="collapse-content">
			<div>
				<label for="libraries">Sélectionnez une médiathèque</label>
				<select id="libraries" class="select" bind:value={selectedLibrary}>
					{#each optionsLibrary as option (option.id)}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="mt-4">
				<label for="months">Sélectionnez un mois</label>
				<select id="months" class="select" bind:value={selectedMonth}>
					{#each optionsMonth as option (option.id)}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
</div>

<style>
	.generatorOptions > div {
		margin: 25px 0;
	}

	.collapse > input[type='checkbox'] {
		position: absolute;
		inset: 0 0 auto 0;
		width: 100%;
		height: 56px;
	}
</style>
