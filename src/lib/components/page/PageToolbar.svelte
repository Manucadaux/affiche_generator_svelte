<script>
	import { Trash2, FilePlus, Copy } from 'lucide-svelte';

	let {
		pageNumber,
		totalPages,
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
			Page {pageNumber}
			<span class="text-sm text-base-content/60">sur {totalPages}</span>
		</p>

		<div class="flex items-center gap-2">
			Nombre d'évènements :

			<div class="eventCounter">
				<button
					class="eventCounterBtn"
					disabled={page.events.length <= 1}
					onclick={() => onRemoveEvent(page.id)}
					aria-label="Retirer un évènement"
				>
					−
				</button>

				<span class="eventCounterValue">{page.events.length}</span>

				<button
					class="eventCounterBtn"
					disabled={page.events.length >= 4}
					onclick={() => onAddEvent(page.id)}
					aria-label="Ajouter un évènement"
				>
					+
				</button>
			</div>

			<label class="ml-4 flex cursor-pointer items-center gap-2 text-base-content">
				<span>Disposition inversé</span>
				<input
					type="checkbox"
					class="checkbox"
					checked={page.reverse ?? false}
					onchange={(event) => onToggleReverse(page.id, event.currentTarget.checked)}
				/>
			</label>
		</div>
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

	.eventCounter {
		display: inline-flex;
		align-items: center;
		border: 1px solid;
		border-color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
		border-radius: 999px;
		padding: 2px 5px;
		gap: 4px;
	}

	.eventCounterBtn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 18px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.eventCounterBtn:hover:not(:disabled) {
		background-color: hsl(var(--bc) / 0.1);
	}

	.eventCounterBtn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.eventCounterValue {
		width: 35px;
		text-align: center;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		border-left: 1px solid color-mix(in oklch, var(--color-base-content) 50%, transparent);
		border-right: 1px solid color-mix(in oklch, var(--color-base-content) 50%, transparent);
	}
</style>
