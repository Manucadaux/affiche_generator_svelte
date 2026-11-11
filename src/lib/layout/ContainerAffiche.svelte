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
		onRemoveEvent,
		onToggleReverse,
		onSelectEvent,
		isEditing
	} = $props();
</script>

<div class="afficheCard card border border-base-300 bg-base-100">
	<HeaderPage
		{pageNumber}
		{page}
		{canDelete}
		{onDeletePage}
		{onAddEvent}
		{onRemoveEvent}
		{onToggleReverse}
	/>

	<div
		class="pageContainer"
		class:editing={isEditing}
		style="height: {innerHeight.current - 140}px;"
	>
		<PageAffiche {selectedLibrary} {selectedMonth} {page} {styles} {onSelectEvent} />
	</div>
</div>

<style>
	.pageContainer {
		width: 100%;
		height: 100%;
		overflow: scroll;
		box-sizing: border-box;
		position: relative;
		padding: 20px 0;
		transition:
			transform 500ms ease,
			width 500ms ease;
	}

	.pageContainer.editing {
		transform: translateX(-200px);
	}

	.afficheCard {
		overflow: hidden;
	}
</style>
