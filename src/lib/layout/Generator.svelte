<script>
	import { resolve } from '$app/paths';
	import ColorPicker from 'svelte-awesome-color-picker';

	let {
		nbPages,
		addPage,
		optionsLibrary,
		optionsMonth,
		selectedLibrary = $bindable(),
		selectedMonth = $bindable(),
		styles = $bindable()
	} = $props();

	let swatches = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
</script>

<div class="generator">
	<p>Général</p>
	<div>
		<button onclick={addPage} class="btn btn-block btn-neutral">
			Ajouter page {nbPages + 1}
		</button>
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

	<div class="colors dark">
		<ColorPicker bind:hex={styles.bgDate} {swatches} label="Couleur fond date" isAlpha={false} />
		<ColorPicker bind:hex={styles.bgTitle} {swatches} label="Couleur fond titre" isAlpha={false} />
		<ColorPicker
			bind:hex={styles.colorDate}
			{swatches}
			label="Couleur texte date"
			isAlpha={false}
		/>
		<ColorPicker
			bind:hex={styles.colorTitle}
			{swatches}
			label="Couleur texte date"
			isAlpha={false}
		/>
		<ColorPicker bind:hex={styles.colorContent} {swatches} label="Couleur texte" isAlpha={false} />
	</div>
	<div>
		<a href={resolve('/render')} class="btn btn-block btn-primary">Générer PDF</a>
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

	.dark {
		--cp-bg-color: #333;
		--cp-border-color: white;
		--cp-text-color: white;
		--cp-input-color: #555;
		--cp-button-hover-color: #777;
	}
</style>
