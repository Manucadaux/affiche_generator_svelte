<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */

	import { X } from '@lucide/svelte';

	/**
	 * @type {{
	 *     documents: AppDocument[],
	 *     defaultLibraryId: number | null,
	 *     optionsLibrary: { id: number, label: string }[],
	 *     optionsMonth: { id: number, label: string }[],
	 *     onClose: () => void,
	 *     onCreate: (options: {
	 *         name: string,
	 *         libraryId: number | null,
	 *         monthId: number | null
	 *     }) => void
	 * }}
	 */
	let { documents, defaultLibraryId, optionsLibrary, optionsMonth, onClose, onCreate } = $props();

	/**
	 * @param {string} baseName
	 * @returns {string}
	 */
	function getUniqueName(baseName) {
		const existingNames = documents.map((document) => document.name.toLocaleLowerCase('fr'));

		if (!existingNames.includes(baseName.toLocaleLowerCase('fr'))) {
			return baseName;
		}

		let suffix = 1;
		let candidate = `${baseName} (${suffix})`;

		while (existingNames.includes(candidate.toLocaleLowerCase('fr'))) {
			suffix++;
			candidate = `${baseName} (${suffix})`;
		}

		return candidate;
	}

	let libraryId = $state((() => defaultLibraryId)());
	let name = $state(getUniqueName('Mon document'));
	let monthId = $state(null);
	let nameError = $state('');

	/**
	 * @param {SubmitEvent} event
	 * @returns {void}
	 */
	function handleSubmit(event) {
		event.preventDefault();

		const trimmedName = name.trim();

		if (!trimmedName) {
			nameError = 'Le nom du document est obligatoire.';
			return;
		}

		onCreate({
			name: getUniqueName(trimmedName),
			libraryId,
			monthId
		});
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
	role="presentation"
>
	<button
		type="button"
		class="absolute inset-0 size-full cursor-default"
		aria-label="Fermer la fenêtre"
		onclick={onClose}
	></button>

	<div
		class="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-base-100 p-6 shadow-xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="new-document-title"
	>
		<header class="mb-6 flex items-center justify-between">
			<h2 id="new-document-title" class="text-xl font-semibold">Nouveau document</h2>

			<button
				type="button"
				class="btn btn-square btn-ghost btn-sm"
				aria-label="Fermer"
				onclick={onClose}
			>
				<X size={20} />
			</button>
		</header>

		<form class="space-y-5" onsubmit={handleSubmit}>
			<div>
				<label for="document-name" class="mb-1 block text-sm font-medium"> Nom du document </label>

				<input
					id="document-name"
					type="text"
					class="input-bordered input w-full"
					bind:value={name}
					oninput={() => (nameError = '')}
					required
				/>

				{#if nameError}
					<p class="mt-1 text-sm text-error">{nameError}</p>
				{/if}
			</div>

			<div>
				<label for="document-library" class="mb-1 block text-sm font-medium"> Médiathèque </label>

				<select id="document-library" class="select-bordered select w-full" bind:value={libraryId}>
					<option value={null}>Sélectionner une médiathèque</option>

					{#each optionsLibrary as option (option.id)}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="document-month" class="mb-1 block text-sm font-medium"> Mois </label>

				<select id="document-month" class="select-bordered select w-full" bind:value={monthId}>
					<option value={null}>Sélectionner un mois</option>

					{#each optionsMonth as option (option.id)}
						<option value={option.id}>{option.label}</option>
					{/each}
				</select>
			</div>

			<div class="flex flex-col gap-2 pt-2">
				<button type="submit" class="btn btn-primary"> Créer le document </button>

				<button type="button" class="btn btn-ghost" onclick={onClose}> Annuler </button>
			</div>
		</form>
	</div>
</div>
