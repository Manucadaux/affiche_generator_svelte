<script>
	// @ts-nocheck
	import PageAffiche from '#lib/components/PageAffiche.svelte';
	import HeaderPage from '#lib/components/HeaderPage.svelte';

	import { innerHeight } from 'svelte/reactivity/window';

	let {
		pageNumber,
		selectedLibrary,
		selectedMonth,
		page,
		styles,
		canDelete,
		onDeletePage,
		onAddEvent,
		onRemoveEvent
	} = $props();
</script>

<HeaderPage {pageNumber} {page} {canDelete} {onDeletePage} {onAddEvent} {onRemoveEvent} />

<div class="pageContainer" style="height: {innerHeight.current - 160}px;">
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
</style>
