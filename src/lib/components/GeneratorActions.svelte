<script>
	import { resolve } from '$app/paths';

	let { onResetEvents, onResetAll } = $props();
</script>

<div>
	<div>
		<a href={resolve('/render')} class="btn btn-block btn-primary"> Générer PDF </a>
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
