<script>
	let { selectedCount = 0, onClose, onSave } = $props();

	let sectionMode = $state('unchanged');
	let updateHighlight = $state(false);
	let highlightValue = $state('');

	let hasChanges = $derived(sectionMode !== 'unchanged' || updateHighlight);

	function handleSave() {
		/** @type {{ section?: string | null, highlight?: string }} */
		const updates = {};

		if (sectionMode !== 'unchanged') {
			updates.section = sectionMode === 'empty' ? null : sectionMode;
		}

		if (updateHighlight) {
			updates.highlight = highlightValue;
		}

		if (Object.keys(updates).length > 0) {
			onSave(updates);
		}
	}
</script>

<div class="modal-open modal" role="dialog" aria-modal="true" aria-labelledby="bulk-edit-title">
	<div class="modal-box max-w-lg">
		<h2 id="bulk-edit-title" class="text-lg font-semibold">Modifier plusieurs évènements</h2>

		<p class="mt-1 text-sm text-base-content/60">
			{selectedCount} évènement{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1
				? 's'
				: ''}
		</p>

		<div class="mt-6 flex flex-col gap-5">
			<label class="form-control">
				<span class="label-text mb-2 font-medium">Section</span>

				<select class="select-bordered select w-full" bind:value={sectionMode}>
					<option value="unchanged">Ne pas modifier</option>
					<option value="empty">Effacer la section</option>
					<option value="Tout public">Tout public</option>
					<option value="Jeunesse">Jeunesse</option>
					<option value="Adulte">Adulte</option>
				</select>
			</label>

			<div class="form-control">
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox checkbox-sm" bind:checked={updateHighlight} />
					<span class="label-text font-medium">Modifier le temps fort</span>
				</label>

				{#if updateHighlight}
					<input
						type="text"
						class="input-bordered input mt-2 w-full"
						placeholder="Nom du temps fort (laisser vide pour effacer)"
						bind:value={highlightValue}
					/>
				{/if}
			</div>
		</div>

		<div class="modal-action mt-8">
			<button type="button" class="btn btn-ghost" onclick={onClose}> Annuler </button>

			<button type="button" class="btn btn-primary" onclick={handleSave} disabled={!hasChanges}>
				Appliquer les modifications
			</button>
		</div>
	</div>

	<button type="button" class="modal-backdrop" aria-label="Fermer" onclick={onClose}></button>
</div>
