<script>
	let {
		addPage,
		optionsLibrary,
		optionsMonth,
		selectedLibrary = $bindable(),
		selectedMonth = $bindable()
	} = $props();
</script>

<div class="generator">
	<p>Général</p>
	<div>
		<button onclick={addPage} class="btn btn-block btn-neutral">Ajouter page</button>
	</div>
	<div>
		<label for="libraries">Sélectionnez une médiathèque</label>
		<select class="select" name="libraries" bind:value={selectedLibrary}>
			{#each optionsLibrary as option (option.id)}
				<option value={option}>{option.label}</option>
			{/each}
		</select>
	</div>
	<div>
		<label for="monthes">Sélectionnez un mois</label>
		<select class="select" name="monthes" bind:value={selectedMonth}>
			{#each optionsMonth as option (option.id)}
				<option value={option}>{option.label}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.generator {
		width: 310px;
		padding: 20px 20px 0;
		height: 100%;
		background: rgb(173, 173, 173);
		position: fixed;
		top: 0;
		left: 0;
	}
</style>
