<script>
	let { onResetEvents, onResetAll, renderHref } = $props();
</script>

<div>
	<div>
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={renderHref} class="btn btn-block btn-primary"> Générer PDF </a>
	</div>

	<div>
		<button class="btn btn-warning" onclick={onResetEvents}> Réinitialiser les évènements </button>
	</div>

	<div>
		<button class="btn btn-error" onclick={onResetAll}> Réinitialiser tout </button>
	</div>
</div>

<style>
	div {
		margin: 25px 0;
	}
</style>
