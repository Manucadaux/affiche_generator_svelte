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
