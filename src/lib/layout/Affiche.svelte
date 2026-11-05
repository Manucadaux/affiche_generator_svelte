<script>
	// @ts-nocheck

	import { innerHeight } from 'svelte/reactivity/window';
	let { pageNumber } = $props();
</script>

<div class="pageContainer" style="height: {innerHeight.current - 160}px;">
	<div class="headerPageContainer">
		<p>Page n° {pageNumber}</p>
	</div>
	<div class="page"></div>
</div>

<style>
	.pageContainer {
		width: 100%;
		height: 100%;
		overflow: scroll;
		box-sizing: content-box;
		border: 1px solid black;
		border-radius: 16px;
		margin-bottom: 40px;
		position: relative;
		padding: 50px 0;
	}

	.headerPageContainer {
		position: absolute;
		top: 0;
		left: 0;
		padding: 8px;
		background: grey;
		width: 100%;
	}

	.page {
		width: 297mm;
		height: 420mm;
		background: white;
		zoom: 50%;
		margin: 0 auto;
	}
</style>
