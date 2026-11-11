<script>
	let {
		nbPages,
		addPage,
		optionsLibrary,
		optionsMonth,
		selectedLibrary = $bindable(),
		selectedMonth = $bindable(),
		styles = $bindable()
	} = $props();
</script>

<div>
	<h3>Général</h3>
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
	div {
		margin: 25px 0;
	}
</style>
