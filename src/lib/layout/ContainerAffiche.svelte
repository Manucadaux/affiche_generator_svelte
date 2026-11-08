<script>
	// @ts-nocheck
	import PageAffiche from '../components/PageAffiche.svelte';

	import { innerHeight } from 'svelte/reactivity/window';
	let { pageNumber, selectedLibrary, selectedMonth, page, styles } = $props();
</script>

<div class="headerPageContainer">
	<p>Page n° {pageNumber}</p>
</div>
<div class="pageContainer" style="height: {innerHeight.current - 120}px;">
	<PageAffiche {selectedLibrary} {selectedMonth} {page} {styles} />
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
</style>
