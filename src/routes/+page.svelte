<script>
	import Affiche from '#lib/layout/Affiche.svelte';
	import Generator from '#lib/layout/Generator.svelte';

	let pages = $state([{ event: '' }]);

	function addPage() {
		pages = [...pages, { event: '' }];
	}
</script>

<Generator {addPage} />
<div class="container">
	{#each pages as page, i}
		<Affiche pageNumber={i + 1} />
	{/each}
</div>

<style>
	:global {
		html,
		body {
			height: 100%;
			width: 100%;
		}

		body {
			background: rgb(220, 220, 220);
		}
	}

	.container {
		width: calc(100% - 360px);
		max-height: calc(100% - 60px);
		position: absolute;
		top: 50px;
		left: 350px;
	}
</style>
