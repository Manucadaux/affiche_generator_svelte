<script>
	import { optionsLibrary } from '#lib/data/options.js';
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import Modal from '#lib/components/ui/Modal.svelte';

	const activeLibraryId = useLocalStorage(
		'newDocumentLibraryId',
		/** @type {number | null} */ (null)
	);

	let isLibraryModalOpen = $state(false);

	/** @type {number | null} */
	let pendingLibraryId = $state(null);

	let activeLibraryLabel = $derived(
		optionsLibrary.find((library) => library.id === activeLibraryId.current)?.label ??
			'Toutes les médiathèques'
	);

	function openLibraryModal() {
		pendingLibraryId = activeLibraryId.current;
		isLibraryModalOpen = true;
	}

	function confirmLibraryChange() {
		activeLibraryId.current = pendingLibraryId;
		isLibraryModalOpen = false;
	}
</script>

<div class="flex flex-wrap items-center gap-3">
	<div class="flex flex-col">
		<span class="text-xs text-base-content/60">Médiathèque active :</span>
		<span class="text-base font-semibold">{activeLibraryLabel}</span>
	</div>

	<button type="button" class="btn btn-neutral btn-sm" onclick={openLibraryModal}>
		Changer de médiathèque
	</button>
</div>

{#if isLibraryModalOpen}
	<Modal title="Changer de médiathèque" onClose={() => (isLibraryModalOpen = false)}>
		<div class="space-y-6">
			<div>
				<label for="active-library" class="mb-2 block text-sm font-medium">
					Médiathèque de travail
				</label>

				<select
					id="active-library"
					class="select-bordered select w-full"
					bind:value={pendingLibraryId}
				>
					<option value={null}>Toutes les médiathèques</option>

					{#each optionsLibrary as library (library.id)}
						<option value={library.id}>{library.label}</option>
					{/each}
				</select>
			</div>

			<footer class="flex justify-end gap-2">
				<button type="button" class="btn btn-ghost" onclick={() => (isLibraryModalOpen = false)}>
					Annuler
				</button>

				<button type="button" class="btn btn-primary" onclick={confirmLibraryChange}>
					Valider
				</button>
			</footer>
		</div>
	</Modal>
{/if}
