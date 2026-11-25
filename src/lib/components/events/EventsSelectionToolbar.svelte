<script>
	let {
		selectedCount = 0,
		totalCount = 0,
		onSelectAll,
		onDeselectAll,
		onEdit,
		onCopy,
		onDuplicate,
		onDelete
	} = $props();

	let hasSelection = $derived(selectedCount > 0);
</script>

<div
	class="flex flex-wrap items-center justify-end gap-2 rounded-box border border-base-300 bg-base-200/60 px-4 py-3"
>
	<span class="mr-2 text-sm text-base-content/60">
		{selectedCount} sélectionné{selectedCount > 1 ? 's' : ''}
		<span class="mx-1">/</span>
		{totalCount} affiché{totalCount > 1 ? 's' : ''}
	</span>

	<button
		type="button"
		class="btn btn-outline btn-sm"
		onclick={hasSelection ? onDeselectAll : onSelectAll}
		disabled={!hasSelection && totalCount === 0}
	>
		{hasSelection ? 'Désélectionner' : 'Tout sélectionner'}
	</button>

	<button type="button" class="btn btn-outline btn-sm" onclick={onEdit} disabled={!hasSelection}>
		Modifier
	</button>

	<button type="button" class="btn btn-outline btn-sm" onclick={onCopy} disabled={!hasSelection}>
		Copier
	</button>

	<button
		type="button"
		class="btn btn-outline btn-sm"
		onclick={onDuplicate}
		disabled={!hasSelection}
	>
		Dupliquer
	</button>

	<button
		type="button"
		class="btn btn-outline btn-error btn-sm"
		onclick={onDelete}
		disabled={!hasSelection}
	>
		Supprimer
	</button>
</div>
