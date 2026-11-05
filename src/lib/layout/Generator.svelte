<script>
	let { addPage } = $props();
</script>

<div class="generator">
	<p>Général</p>
	<p>
		<button
			onclick={addPage}
			class="rounded border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-800 shadow hover:bg-gray-100"
			>Ajouter page</button
		>
	</p>
</div>

<style>
	.generator {
		width: 310px;
		padding: 20px 20px 0;
		height: 100%;
		background: rgb(173, 173, 173);
		position: fixed;
		top: 0;
		left: 0;
	}
</style>
