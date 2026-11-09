<script>
	let {
		nbPages,
		addPage,
		optionsLibrary,
		optionsMonth,
		selectedLibrary = $bindable(),
		selectedMonth = $bindable()
	} = $props();
</script>

<div>
	<h3>Général</h3>
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
