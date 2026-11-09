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
		styles = $bindable(),
		onResetEvents,
		onResetAll
	} = $props();

	let swatches = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
</script>

<div class="generator bg-base-300">
	<p>Général</p>
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
			label="Couleur texte titre"
			isAlpha={false}
		/>
		<ColorPicker bind:hex={styles.colorContent} {swatches} label="Couleur texte" isAlpha={false} />
	</div>
	<div>
		<a href={resolve('/render')} class="btn btn-block btn-primary">Générer PDF</a>
	</div>
	<div>
		<button class="btn btn-warning" onclick={onResetEvents}>Réinitialiser les évènements</button>
	</div>
	<div>
		<button class="btn btn-error" onclick={onResetAll}>Réinitialiser tout</button>
	</div>
</div>

<style>
	.generator {
		width: 310px;
		padding: 20px 20px 0;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;

		> div {
			margin: 25px 0;
		}
	}

	.dark {
		--cp-bg-color: #333;
		--cp-border-color: white;
		--cp-text-color: white;
		--cp-input-color: #555;
		--cp-button-hover-color: #777;
	}
</style>
