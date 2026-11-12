<script>
	import ColorPicker from 'svelte-awesome-color-picker';

	let { styles = $bindable() } = $props();

	let swatches = [
		'#ea3c45',
		'#f58220',
		'#f9c54e',
		'#2fa38f',
		'#0256e2',
		'#b02082',
		'#9b1d2a',
		'#c2571a',
		'#c79a1e',
		'#1f7a4d',
		'#003288',
		'#660c49'
	];
</script>

<div class="colors">
	<ColorPicker
		bind:hex={styles.bgDate}
		{swatches}
		label="Couleur fond date"
		isAlpha={false}
		textInputModes={['hex']}
	/>

	<ColorPicker
		bind:hex={styles.bgTitle}
		{swatches}
		label="Couleur fond titre"
		isAlpha={false}
		textInputModes={['hex']}
	/>

	<ColorPicker
		bind:hex={styles.colorDate}
		{swatches}
		label="Couleur texte date"
		isAlpha={false}
		textInputModes={['hex']}
	/>

	<ColorPicker
		bind:hex={styles.colorTitle}
		{swatches}
		label="Couleur texte titre"
		isAlpha={false}
		textInputModes={['hex']}
	/>

	<ColorPicker
		bind:hex={styles.colorContent}
		{swatches}
		label="Couleur texte"
		isAlpha={false}
		textInputModes={['hex']}
	/>
</div>

<p class="mt-3 text-sm text-base-content/60">
	Besoin d'inspiration ?
	<a
		href="https://coolors.co/palettes/trending"
		target="_blank"
		rel="noopener noreferrer"
		class="link"
	>
		Coolors.co
	</a>
</p>

<style>
	.colors :global(.input-container input) {
		color: #1f1e1e;
	}

	.colors :global(.button-like) {
		display: none;
	}

	.colors :global(.swatches) {
		width: 98%;
	}
</style>
