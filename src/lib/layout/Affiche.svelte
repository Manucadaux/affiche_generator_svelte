<script>
	// @ts-nocheck

	import { innerHeight } from 'svelte/reactivity/window';
	let { children, pageNumber, page } = $props();
</script>

<div class="headerPageContainer">
	<p>Page n° {pageNumber}</p>
</div>
<div class="pageContainer" style="height: {innerHeight.current - 160}px;">
	<div class="page">
		<p>{page.id}</p>
		{@render children()}
	</div>
</div>

<style>
	.pageContainer {
		width: 100%;
		height: 100%;
		overflow: scroll;
		box-sizing: content-box;
		border: 1px solid black;
		border-top: none;
		border-radius: 0 0 16px 16px;
		margin-bottom: 40px;
		position: relative;
		padding: 20px 0;
	}

	.headerPageContainer {
		padding: 8px;
		background: grey;
		border: 1px solid black;
		border-bottom: none;
		border-radius: 16px 16px 0 0;
		width: 100%;
	}

	.page {
		width: 297mm;
		height: 420mm;
		background: white;
		zoom: 40%;
		margin: 0 auto;
		color: black;
	}
</style>
