<script>
	import ColorPicker from 'svelte-awesome-color-picker';

	let { styles = $bindable(), onUpdateStyle, onBeginColorEdit, onEndColorEdit } = $props();

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

	let isBgDateOpen = $state(false);
	let isBgTitleOpen = $state(false);
	let isColorDateOpen = $state(false);
	let isColorTitleOpen = $state(false);
	let isColorContentOpen = $state(false);

	let wasAnyColorPickerOpen = false;

	// Regroupe les modifications tant qu'au moins un sélecteur est ouvert.
	$effect(() => {
		const isAnyColorPickerOpen =
			isBgDateOpen || isBgTitleOpen || isColorDateOpen || isColorTitleOpen || isColorContentOpen;

		if (isAnyColorPickerOpen === wasAnyColorPickerOpen) return;

		wasAnyColorPickerOpen = isAnyColorPickerOpen;

		if (isAnyColorPickerOpen) {
			onBeginColorEdit();
		} else {
			onEndColorEdit();
		}
	});

	/**
	 * Transmet une nouvelle couleur à l'historique.
	 * @param {'bgDate' | 'bgTitle' | 'colorDate' | 'colorTitle' | 'colorContent'} property
	 * @param {{ hex: string | null }} color
	 */
	function handleColorInput(property, color) {
		if (color.hex) {
			onUpdateStyle(property, color.hex);
		}
	}
</script>

<div class="collapse-arrow collapse rounded-box border border-base-content/20">
	<input type="checkbox" checked />

	<div class="collapse-title font-medium">Couleurs</div>

	<div class="collapse-content">
		<div class="colors">
			<ColorPicker
				hex={styles.bgDate}
				bind:isOpen={isBgDateOpen}
				onInput={(color) => handleColorInput('bgDate', color)}
				{swatches}
				label="Couleur fond date"
				isAlpha={false}
				textInputModes={['hex']}
			/>

			<ColorPicker
				hex={styles.bgTitle}
				bind:isOpen={isBgTitleOpen}
				onInput={(color) => handleColorInput('bgTitle', color)}
				{swatches}
				label="Couleur fond titre"
				isAlpha={false}
				textInputModes={['hex']}
			/>

			<ColorPicker
				hex={styles.colorDate}
				bind:isOpen={isColorDateOpen}
				onInput={(color) => handleColorInput('colorDate', color)}
				{swatches}
				label="Couleur texte date"
				isAlpha={false}
				textInputModes={['hex']}
			/>

			<ColorPicker
				hex={styles.colorTitle}
				bind:isOpen={isColorTitleOpen}
				onInput={(color) => handleColorInput('colorTitle', color)}
				{swatches}
				label="Couleur texte titre"
				isAlpha={false}
				textInputModes={['hex']}
			/>

			<ColorPicker
				hex={styles.colorContent}
				bind:isOpen={isColorContentOpen}
				onInput={(color) => handleColorInput('colorContent', color)}
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
	</div>
</div>

<style>
	.collapse > input[type='checkbox'] {
		position: absolute;
		inset: 0 0 auto 0;
		width: 100%;
		height: 56px;
	}

	.collapse {
		position: relative;
		z-index: 10;
	}

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
