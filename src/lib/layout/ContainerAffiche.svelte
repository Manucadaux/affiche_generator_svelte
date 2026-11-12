<script>
	// @ts-nocheck
	import PageAffiche from '#lib/components/page/PageAffiche.svelte';
	import PageToolbar from '#lib/components/page/PageToolbar.svelte';

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
		isEditing,
		onAddPage,
		onDuplicatePage,
		selectedEventId
	} = $props();
</script>

<div class="afficheCard card border border-base-300 bg-base-100">
	<PageToolbar
		{pageNumber}
		{page}
		{canDelete}
		{onDeletePage}
		{onAddEvent}
		{onRemoveEvent}
		{onToggleReverse}
		{onAddPage}
		{onDuplicatePage}
	/>

	<div class="pageContainer" class:editing={isEditing}>
		<PageAffiche
			{selectedLibrary}
			{selectedMonth}
			{page}
			{styles}
			{onSelectEvent}
			{selectedEventId}
		/>
	</div>
</div>

<style>
	.pageContainer {
		width: 100%;
		height: fit-content;
		overflow: auto;
		box-sizing: border-box;
		position: relative;
		padding: 20px 0;
		transition: transform 500ms ease;
	}

	.pageContainer.editing {
		transform: translateX(-200px);
	}

	.afficheCard {
		overflow: hidden;
	}
</style>
