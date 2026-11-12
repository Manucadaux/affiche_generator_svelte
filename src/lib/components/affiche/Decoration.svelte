<script>
	let { styles } = $props();
</script>

<div class="bands" style:--band-color={styles.bgDate}>
	<span class="band left vertical"></span>
	<span class="band right vertical"></span>
	<span class="band left horizontal"></span>
	<span class="band right horizontal"></span>
</div>

<style>
	.bands {
		--band-color: var(--primary-color-bg);
	}

	.band {
		display: block;
		background-color: var(--band-color);
		position: absolute;
	}

	.vertical {
		height: calc(100% - 65px);
		width: 30px;
		top: 20px;
	}

	.horizontal {
		height: 30px;
		width: 200px;
		bottom: 20px;
	}

	.left {
		left: 20px;
	}

	.right {
		right: 20px;
	}
</style>
