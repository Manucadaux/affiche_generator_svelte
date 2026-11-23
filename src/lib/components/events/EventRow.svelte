<script>
	import { ChevronDown, ChevronRight, Pencil } from '@lucide/svelte';
	import { optionsLibrary } from '#lib/data/options.js';
	import { slide } from 'svelte/transition';

	/**
	 * @type {{
	 *   event: import('#lib/utils/types.js').ManagedEvent,
	 *   isExpanded: boolean,
	 *   isSelected: boolean,
	 *   isDraft?: boolean,
	 *   onToggle: () => void,
	 *   onToggleSelection: () => void,
	 *   onEdit?: () => void,
	 *   onDraftChange?: (field: string, value: any) => void,
	 *   onDraftSave?: () => void,
	 *   onDraftCancel?: () => void,
	 *   draftError?: string,
	 *   isSavingDraft?: boolean
	 * }}
	 */
	let {
		event,
		isExpanded,
		isSelected,
		isDraft = false,
		onToggle,
		onToggleSelection,
		onEdit = () => {},
		onDraftChange = () => {},
		onDraftSave = () => {},
		onDraftCancel = () => {},
		draftError = '',
		isSavingDraft = false
	} = $props();

	const libraryName = $derived(
		optionsLibrary.find((library) => library.id === event.libraryId)?.label ??
			'Médiathèque inconnue'
	);

	/**
	 * Formate une date au format français.
	 * @param {string | null} dateString
	 */
	function formatDate(dateString) {
		if (!dateString) return '';

		const [year, month, day] = dateString.split('-');
		const date = new Date(Number(year), Number(month) - 1, Number(day));

		return new Intl.DateTimeFormat('fr-FR').format(date);
	}

	const formattedDate = $derived(event.startDate ? formatDate(event.startDate) : 'Date à définir');
	const formattedEndDate = $derived(event.endDate ? formatDate(event.endDate) : '');

	// Une période n'affiche pas les horaires sur la ligne principale.
	const formattedTime = $derived(
		event.endDate
			? ''
			: event.timeSlots
					.map((slot) => {
						if (slot.start && slot.end) return `${slot.start} – ${slot.end}`;
						return slot.start || slot.end;
					})
					.filter(Boolean)
					.join(', ')
	);

	const firstTimeSlot = $derived(event.timeSlots[0] ?? { start: '', end: '' });

	// Un événement est complet lorsque les huit critères sont renseignés.
	const isComplete = $derived(
		Boolean(
			event.title.trim() &&
			event.libraryId !== null &&
			event.section &&
			event.startDate &&
			event.description.trim() &&
			event.posterDescription.trim() &&
			event.bookletDescription.trim() &&
			event.onlineDescription.trim()
		)
	);

	/**
	 * Affiche une valeur ou le texte par défaut.
	 * @param {string | null | undefined} value
	 */
	function displayValue(value) {
		return value?.trim() || 'Non renseigné';
	}

	/**
	 * Applique une couleur plus discrète aux valeurs manquantes.
	 * @param {string | null | undefined} value
	 */
	function valueClass(value) {
		return value?.trim() ? '' : 'text-base-content/40';
	}
</script>

<article class="overflow-hidden rounded-box border border-base-content/30 bg-base-100">
	<div class="flex items-center gap-3 px-4 py-3">
		<!-- Sélection -->
		<input
			type="checkbox"
			class="checkbox shrink-0 checkbox-sm"
			checked={isSelected}
			onchange={onToggleSelection}
			aria-label={`Sélectionner ${event.title || 'cet événement'}`}
		/>

		<!-- Informations principales -->
		<div
			class="grid min-w-0 flex-1 grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]"
		>
			{#if isDraft}
				<!-- Titre -->
				<input
					type="text"
					class="input-bordered input w-full input-sm"
					placeholder="Titre de l'événement"
					aria-label="Titre de l'événement"
					value={event.title}
					oninput={(e) => onDraftChange('title', e.currentTarget.value)}
				/>

				<!-- Médiathèque -->
				<select
					class="select-bordered select w-full select-sm"
					aria-label="Médiathèque"
					value={event.libraryId ?? ''}
					onchange={(e) =>
						onDraftChange(
							'libraryId',
							e.currentTarget.value ? Number(e.currentTarget.value) : null
						)}
				>
					<option value="">Choisir une médiathèque</option>
					{#each optionsLibrary as library (library.id)}
						<option value={library.id}>{library.label}</option>
					{/each}
				</select>

				<!-- Date -->
				<input
					type="date"
					class="input-bordered input w-full input-sm"
					aria-label="Date de début"
					value={event.startDate ?? ''}
					oninput={(e) => onDraftChange('startDate', e.currentTarget.value || null)}
				/>

				<!-- Section -->
				<select
					class="select-bordered select w-full select-sm"
					aria-label="Section"
					value={event.section ?? ''}
					onchange={(e) => onDraftChange('section', e.currentTarget.value || null)}
				>
					<option value="">Choisir une section</option>
					<option value="Tout public">Tout public</option>
					<option value="Jeunesse">Jeunesse</option>
					<option value="Adulte">Adulte</option>
				</select>

				<!-- Inscription -->
				<span class="text-sm">
					{event.inscription ? 'Avec inscription' : 'Sans inscription'}
				</span>

				<!-- Temps fort -->
				<input
					type="text"
					class="input-bordered input w-full input-sm"
					placeholder="Temps fort"
					aria-label="Temps fort"
					value={event.highlight}
					oninput={(e) => onDraftChange('highlight', e.currentTarget.value)}
				/>

				<!-- Statut -->
				<span class="text-sm text-base-content/60">Brouillon</span>
			{:else}
				<!-- Événement existant -->
				<button
					type="button"
					class="col-span-full grid min-w-0 grid-cols-1 items-center gap-2 text-left sm:grid-cols-subgrid"
					aria-expanded={isExpanded}
					onclick={onToggle}
				>
					<span class="min-w-0">
						<span class="block text-xs text-base-content/50">Titre</span>
						<span class="block truncate font-medium">
							{event.title || 'Événement sans titre'}
						</span>
					</span>

					<span class="min-w-0">
						<span class="block text-xs text-base-content/50">Médiathèque</span>
						<span class="block truncate text-sm">{libraryName}</span>
					</span>

					<span class="min-w-0">
						<span class="block text-xs text-base-content/50">Date et horaires</span>
						<span class="block text-sm">
							{#if event.endDate}
								{formattedDate} au {formattedEndDate}
							{:else}
								{formattedDate}
								{#if formattedTime}
									<span class="block text-base-content/60">{formattedTime}</span>
								{/if}
							{/if}
						</span>
					</span>

					<span class="min-w-0">
						<span class="block text-xs text-base-content/50">Public</span>
						<span class={`block truncate text-sm ${valueClass(event.condition)}`}>
							{displayValue(event.condition)}
						</span>
					</span>

					<span class="min-w-0">
						<span class="block text-xs text-base-content/50">Inscription</span>
						<span class="block text-sm">
							{event.inscription ? 'Avec inscription' : 'Sans inscription'}
						</span>
					</span>

					<span class="min-w-0">
						<span class="block text-xs text-base-content/50">Temps fort</span>
						<span class={`block truncate text-sm ${valueClass(event.highlight)}`}>
							{displayValue(event.highlight)}
						</span>
					</span>

					<span class="min-w-0">
						<span class="block text-xs text-base-content/50">État</span>
						{#if isComplete}
							<span class="badge badge-sm whitespace-nowrap badge-success">Complet</span>
						{:else}
							<span class="badge badge-sm whitespace-nowrap badge-warning">Incomplet</span>
						{/if}
					</span>
				</button>
			{/if}
		</div>

		<button
			type="button"
			class="btn btn-square btn-ghost btn-sm"
			onclick={onEdit}
			aria-label="Modifier l'évènement"
			title="Modifier"
		>
			<Pencil size={16} />
		</button>

		<!-- Chevron indépendant, toujours à droite -->
		<button
			type="button"
			class="btn btn-square shrink-0 btn-ghost btn-sm"
			aria-label={isExpanded ? 'Réduire les détails' : 'Afficher les détails'}
			aria-expanded={isExpanded}
			onclick={onToggle}
		>
			{#if isExpanded}
				<ChevronDown size={18} />
			{:else}
				<ChevronRight size={18} />
			{/if}
		</button>
	</div>

	{#if isExpanded}
		<div
			class="overflow-hidden border-t border-base-content/20 bg-base-200/30"
			transition:slide={{ duration: 220 }}
		>
			<div class="px-4 py-4">
				{#if isDraft}
					<!-- Champs complémentaires du brouillon -->
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<label class="form-control">
							<span class="label-text mb-1">Lieu de l'événement</span>
							<input
								class="input-bordered input w-full input-sm"
								value={event.location}
								oninput={(e) => onDraftChange('location', e.currentTarget.value)}
							/>
						</label>

						<label class="form-control">
							<span class="label-text mb-1">Genre</span>
							<input
								class="input-bordered input w-full input-sm"
								value={event.genre}
								oninput={(e) => onDraftChange('genre', e.currentTarget.value)}
							/>
						</label>

						<label class="form-control">
							<span class="label-text mb-1">Type d'action</span>
							<input
								class="input-bordered input w-full input-sm"
								value={event.actionType}
								oninput={(e) => onDraftChange('actionType', e.currentTarget.value)}
							/>
						</label>

						<label class="form-control">
							<span class="label-text mb-1">Prestataires</span>
							<input
								class="input-bordered input w-full input-sm"
								value={event.providers}
								oninput={(e) => onDraftChange('providers', e.currentTarget.value)}
							/>
						</label>

						<label class="form-control">
							<span class="label-text mb-1">Partenaire</span>
							<input
								class="input-bordered input w-full input-sm"
								value={event.partner}
								oninput={(e) => onDraftChange('partner', e.currentTarget.value)}
							/>
						</label>

						<label class="form-control">
							<span class="label-text mb-1">Montant</span>
							<input
								class="input-bordered input w-full input-sm"
								value={event.amount}
								oninput={(e) => onDraftChange('amount', e.currentTarget.value)}
							/>
						</label>
					</div>

					<!-- Horaires -->
					<div class="mt-4 grid gap-4 sm:grid-cols-2">
						<label class="form-control">
							<span class="label-text mb-1">Heure de début</span>
							<input
								type="time"
								class="input-bordered input w-full input-sm"
								value={firstTimeSlot.start}
								oninput={(e) =>
									onDraftChange('timeSlots', [{ ...firstTimeSlot, start: e.currentTarget.value }])}
							/>
						</label>

						<label class="form-control">
							<span class="label-text mb-1">Heure de fin</span>
							<input
								type="time"
								class="input-bordered input w-full input-sm"
								value={firstTimeSlot.end}
								oninput={(e) =>
									onDraftChange('timeSlots', [{ ...firstTimeSlot, end: e.currentTarget.value }])}
							/>
						</label>
					</div>

					<!-- Description générale -->
					<label class="form-control mt-4">
						<span class="label-text mb-1">Description générale</span>
						<textarea
							class="textarea-bordered textarea w-full"
							rows="3"
							value={event.description}
							oninput={(e) => onDraftChange('description', e.currentTarget.value)}></textarea>
					</label>

					<!-- Commentaire -->
					<label class="form-control mt-4">
						<span class="label-text mb-1">Commentaire</span>
						<textarea
							class="textarea-bordered textarea w-full"
							rows="2"
							value={event.comment}
							oninput={(e) => onDraftChange('comment', e.currentTarget.value)}></textarea>
					</label>

					<!-- Inscription -->
					<label class="label mt-3 flex cursor-pointer justify-start gap-3">
						<input
							type="checkbox"
							class="checkbox checkbox-sm"
							checked={event.inscription}
							onchange={(e) => onDraftChange('inscription', e.currentTarget.checked)}
						/>
						<span class="label-text">Avec inscription</span>
					</label>

					<div
						class="mt-5 flex flex-col gap-3 border-t border-base-content/10 pt-4 sm:flex-row sm:items-center sm:justify-between"
					>
						<div class="min-w-0">
							{#if draftError}
								<p class="text-sm text-error" role="alert">{draftError}</p>
							{:else}
								<p class="text-xs text-base-content/60">
									Le titre et la date de début sont obligatoires.
								</p>
							{/if}
						</div>

						<div class="flex justify-end gap-2">
							<button
								type="button"
								class="btn btn-ghost btn-sm"
								onclick={onDraftCancel}
								disabled={isSavingDraft}
							>
								Annuler
							</button>
							<button
								type="button"
								class="btn btn-primary btn-sm"
								onclick={onDraftSave}
								disabled={!event.title.trim() || !event.startDate || isSavingDraft}
							>
								{#if isSavingDraft}
									<span class="loading loading-xs loading-spinner"></span>
									Enregistrement…
								{:else}
									Enregistrer l'événement
								{/if}
							</button>
						</div>
					</div>
				{:else}
					<!-- Détails d'un événement existant -->

					<!-- Informations générales -->
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						<div>
							<p class="text-xs text-base-content/50">Section</p>
							<p class={valueClass(event.section)}>{displayValue(event.section)}</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Lieu</p>
							<p class={valueClass(event.location)}>{displayValue(event.location)}</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Date de début</p>
							<p class={!event.startDate ? 'text-base-content/40' : ''}>
								{event.startDate ? formattedDate : 'Non renseigné'}
							</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Date de fin</p>
							<p class={!event.endDate ? 'text-base-content/40' : ''}>
								{event.endDate ? formattedEndDate : 'Non renseigné'}
							</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Horaires</p>
							<p
								class={valueClass(
									event.timeSlots
										.map((slot) => {
											if (slot.start && slot.end) return `${slot.start} – ${slot.end}`;
											return slot.start || slot.end;
										})
										.filter(Boolean)
										.join(', ')
								)}
							>
								{displayValue(
									event.timeSlots
										.map((slot) => {
											if (slot.start && slot.end) return `${slot.start} – ${slot.end}`;
											return slot.start || slot.end;
										})
										.filter(Boolean)
										.join(', ')
								)}
							</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Temps fort lié</p>
							<p class={valueClass(event.highlight)}>{displayValue(event.highlight)}</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Genre</p>
							<p class={valueClass(event.genre)}>{displayValue(event.genre)}</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Type d'action</p>
							<p class={valueClass(event.actionType)}>{displayValue(event.actionType)}</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Prestataires</p>
							<p class={valueClass(event.providers)}>{displayValue(event.providers)}</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Partenaire</p>
							<p class={valueClass(event.partner)}>{displayValue(event.partner)}</p>
						</div>

						<div>
							<p class="text-xs text-base-content/50">Montant</p>
							<p class={valueClass(event.amount)}>{displayValue(event.amount)}</p>
						</div>
					</div>

					<!-- Descriptions -->
					<div class="mt-5 grid gap-4 sm:grid-cols-2">
						<div>
							<p class="mb-1 text-xs text-base-content/50">Description générale</p>
							<p class={`whitespace-pre-line ${valueClass(event.description)}`}>
								{displayValue(event.description)}
							</p>
						</div>

						<div>
							<p class="mb-1 text-xs text-base-content/50">Description pour l'affiche</p>
							<p class={`whitespace-pre-line ${valueClass(event.posterDescription)}`}>
								{displayValue(event.posterDescription)}
							</p>
						</div>

						<div>
							<p class="mb-1 text-xs text-base-content/50">Description pour le livret</p>
							<p class={`whitespace-pre-line ${valueClass(event.bookletDescription)}`}>
								{displayValue(event.bookletDescription)}
							</p>
						</div>

						<div>
							<p class="mb-1 text-xs text-base-content/50">Description pour l'agenda en ligne</p>
							<p class={`whitespace-pre-line ${valueClass(event.onlineDescription)}`}>
								{displayValue(event.onlineDescription)}
							</p>
						</div>
					</div>

					<div class="mt-4 border-t border-base-content/10 pt-4">
						<p class="mb-1 text-xs text-base-content/50">Commentaire</p>
						<p class={`whitespace-pre-line ${valueClass(event.comment)}`}>
							{displayValue(event.comment)}
						</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</article>
