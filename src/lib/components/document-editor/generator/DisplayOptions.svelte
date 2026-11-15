<script>
	let { styles = $bindable() } = $props();

	let autoZoom = $derived(styles.autoZoom !== false);

	/**
	 * @param {Event & { currentTarget: HTMLInputElement }} e
	 */
	function handleZoomChange(e) {
		styles = {
			...styles,
			zoom: Number(e.currentTarget.value),
			autoZoom: false
		};
	}

	/**
	 * @param {Event & { currentTarget: HTMLInputElement }} e
	 */
	function handleAutoZoomChange(e) {
		styles = {
			...styles,
			autoZoom: e.currentTarget.checked
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

		<label class="autoZoomControl">
			<input
				type="checkbox"
				class="checkbox checkbox-primary"
				checked={autoZoom}
				onchange={handleAutoZoomChange}
			/>
			Ajuster automatiquement le zoom
		</label>
	</div>
</div>

<style>
	.displayOptions > div {
		margin: 25px 0;
	}

	.autoZoomControl {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 12px;
		cursor: pointer;
	}
</style>
