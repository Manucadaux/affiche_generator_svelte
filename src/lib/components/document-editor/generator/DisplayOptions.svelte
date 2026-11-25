<script>
	let { styles = $bindable() } = $props();

	/**
	 * @param {Event & { currentTarget: HTMLInputElement }} e
	 */
	function handleZoomChange(e) {
		styles = {
			...styles,
			zoom: Number(e.currentTarget.value)
		};
	}
</script>

<div class="displayOptions">
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
			oninput={handleZoomChange}
			class="range range-primary"
		/>
	</div>
</div>

<style>
	.displayOptions > div {
		margin: 25px 0;
	}
</style>
