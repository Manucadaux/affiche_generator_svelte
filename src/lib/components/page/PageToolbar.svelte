<script>
	import { Trash2, FilePlus, Copy } from 'lucide-svelte';

	let {
		pageNumber,
		page,
		canDelete,
		onDeletePage,
		onAddEvent,
		onRemoveEvent,
		onToggleReverse,
		onAddPage,
		onDuplicatePage
	} = $props();
</script>

<div class="headerPageContainer bg-base-300">
	<div>
		<p>
			Page n° {pageNumber}
			<label class="label">
				<input
					type="checkbox"
					class="checkbox checkbox-xs"
					checked={page.reverse ?? false}
					onchange={(event) => onToggleReverse(page.id, event.currentTarget.checked)}
				/>
				Layout inversé
			</label>
		</p>

		<p>
			Nombre d'évènements :
			<button
				class="btn btn-sm"
				disabled={page.events.length <= 1}
				onclick={() => onRemoveEvent(page.id)}
			>
				-
			</button>

			{page.events.length}

			<button
				class="btn btn-sm"
				disabled={page.events.length >= 4}
				onclick={() => onAddEvent(page.id)}
			>
				+
			</button>
		</p>
	</div>
	<div class="mr-5 flex gap-3">
		<div class="tooltip tooltip-bottom" data-tip="Supprimer la page">
			<button
				class="btn btn-error btn-md"
				disabled={!canDelete}
				onclick={() => onDeletePage(page.id)}
				aria-label="Supprimer cette page"
			>
				<Trash2 size={22} />
			</button>
		</div>

		<div class="tooltip tooltip-bottom" data-tip="Dupliquer la page">
			<button
				class="btn btn-neutral btn-md"
				onclick={() => onDuplicatePage(page.id)}
				aria-label="Dupliquer cette page"
			>
				<Copy size={22} />
			</button>
		</div>

		<div class="tooltip tooltip-bottom" data-tip="Nouvelle page">
			<button
				class="btn btn-neutral btn-md"
				onclick={() => onAddPage(page.id)}
				aria-label="Ajouter une page après celle-ci"
			>
				<FilePlus size={22} />
			</button>
		</div>
	</div>
</div>

<style>
	.headerPageContainer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px;
		width: 100%;
		box-sizing: border-box;
	}

	label {
		margin-left: 20px;
	}
</style>
