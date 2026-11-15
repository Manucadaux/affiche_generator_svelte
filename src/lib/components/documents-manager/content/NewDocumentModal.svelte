<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */
	/** @typedef {import('#lib/utils/types.js').Styles} Styles */

	import { X } from 'lucide-svelte';
	import ColorPicker from 'svelte-awesome-color-picker';

	/** @type {{
		documents: AppDocument[],
		defaultLibraryId: number | null,
		defaultStyles: Styles,
		optionsLibrary: { id: number, label: string }[],
		optionsMonth: { id: number, label: string }[],
		onClose: () => void,
		onCreate: (options: {
			name: string,
			libraryId: number | null,
			monthId: number | null,
			styles: Styles
		}) => void
	}} */
	let {
		documents,
		defaultLibraryId,
		defaultStyles,
		optionsLibrary,
		optionsMonth,
		onClose,
		onCreate
	} = $props();

	const swatches = [
		'#ea3c45',
		'#f58220',
		'#f9c54e',
		'#2fa38f',
		'#0256e2',
		'#b02082',
		'#9b1d2a',
		'#c2571a',
		'#c79a1e',
		'#1f7a4d',
		'#003288',
		'#660c49'
	];

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

	/**
	 * Initialise les valeurs du formulaire.
	 * @returns {{ libraryId: number | null, styles: Styles }}
	 */
	function getInitialValues() {
		return {
			libraryId: defaultLibraryId,
			styles: { ...defaultStyles }
		};
	}

	const initialValues = getInitialValues();

	let libraryId = $state(initialValues.libraryId);
	let styles = $state(initialValues.styles);
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
			monthId,
			styles: { ...styles }
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

			<div class="space-y-3">
				<h3 class="text-sm font-medium">Couleurs</h3>

				<ColorPicker
					bind:hex={styles.bgDate}
					{swatches}
					label="Couleur fond date"
					isAlpha={false}
					textInputModes={['hex']}
				/>

				<ColorPicker
					bind:hex={styles.bgTitle}
					{swatches}
					label="Couleur fond titre"
					isAlpha={false}
					textInputModes={['hex']}
				/>

				<ColorPicker
					bind:hex={styles.colorDate}
					{swatches}
					label="Couleur texte date"
					isAlpha={false}
					textInputModes={['hex']}
				/>

				<ColorPicker
					bind:hex={styles.colorTitle}
					{swatches}
					label="Couleur texte titre"
					isAlpha={false}
					textInputModes={['hex']}
				/>

				<ColorPicker
					bind:hex={styles.colorContent}
					{swatches}
					label="Couleur texte"
					isAlpha={false}
					textInputModes={['hex']}
				/>
			</div>

			<div class="flex flex-col gap-2 pt-2">
				<button type="submit" class="btn btn-primary"> Créer le document </button>

				<button type="button" class="btn btn-ghost" onclick={onClose}> Annuler </button>
			</div>
		</form>
	</div>
</div>
