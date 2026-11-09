<script>
	import ColorPicker from 'svelte-awesome-color-picker';

	let { styles = $bindable() } = $props();

	let swatches = ['#f44336', '#e91e63', '#9c27b0', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
</script>

<div class="colors dark">
	<ColorPicker bind:hex={styles.bgDate} {swatches} label="Couleur fond date" isAlpha={false} />

	<ColorPicker bind:hex={styles.bgTitle} {swatches} label="Couleur fond titre" isAlpha={false} />

	<ColorPicker bind:hex={styles.colorDate} {swatches} label="Couleur texte date" isAlpha={false} />

	<ColorPicker
		bind:hex={styles.colorTitle}
		{swatches}
		label="Couleur texte titre"
		isAlpha={false}
	/>

	<ColorPicker bind:hex={styles.colorContent} {swatches} label="Couleur texte" isAlpha={false} />
</div>

<style>
	.dark {
		--cp-bg-color: #333;
		--cp-border-color: white;
		--cp-text-color: white;
		--cp-input-color: #555;
		--cp-button-hover-color: #777;
	}
</style>
