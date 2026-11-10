<script>
	import LogoSvg from './LogoSvg.svelte';

	let { styles } = $props();
</script>

<div class="footer">
	<p style:color={styles.colorContent}>Plus d'information sur https://mediatheques.agglo-pau.fr</p>

	<div class="logoContainer" style:color={styles.bgTitle}>
		<LogoSvg />
	</div>
</div>

<style>
	.footer {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		font-size: 25px;
		text-transform: uppercase;
		color: var(--text-font-color);
		transform: translateY(-15px);

		p {
			margin: 0;
			padding: 0;
		}
	}

	.logoContainer {
		width: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	:global(.logo) {
		display: block;
		width: min(500px, 80%);
		height: auto;
	}
</style>
