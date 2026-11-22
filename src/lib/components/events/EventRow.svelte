<script>
	import { ChevronDown, ChevronRight } from '@lucide/svelte';
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
	 *   onDraftChange?: (field: string, value: any) => void
	 * }}
	 */
	let {
		event,
		isExpanded,
		isSelected,
		isDraft = false,
		onToggle,
		onToggleSelection,
		onDraftChange = () => {}
	} = $props();

	const libraryName = $derived(
		optionsLibrary.find((library) => library.id === event.libraryId)?.label ??
			'Médiathèque inconnue'
	);

	const formattedDate = $derived.by(() => {
		if (!event.startDate) return 'Date à définir';

		const [year, month, day] = event.startDate.split('-');
		const date = new Date(Number(year), Number(month) - 1, Number(day));

		return new Intl.DateTimeFormat('fr-FR').format(date);
	});

	const formattedTime = $derived(
		event.timeSlots
			.map((slot) => {
				if (slot.start && slot.end) return `${slot.start} – ${slot.end}`;
				return slot.start || slot.end;
			})
			.filter(Boolean)
			.join(', ')
	);

	const firstTimeSlot = $derived(event.timeSlots[0] ?? { start: '', end: '' });
</script>

<article class="overflow-hidden rounded-box border border-base-300 bg-base-100">
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
			class="grid min-w-0 flex-1 grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)]"
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
			{:else}
				<!-- Événement existant -->
				<button
					type="button"
					class="col-span-full grid min-w-0 grid-cols-1 items-center gap-2 text-left sm:grid-cols-subgrid"
					aria-expanded={isExpanded}
					onclick={onToggle}
				>
					<span class="truncate font-medium">
						{event.title || 'Événement sans titre'}
					</span>

					<span class="truncate text-sm text-base-content/70">
						{libraryName}
					</span>

					<span class="text-sm">
						{formattedDate}
						{#if formattedTime}
							<span class="block text-base-content/60">{formattedTime}</span>
						{/if}
					</span>

					<span class="text-sm">{event.section || '—'}</span>

					<span class="text-sm">
						{event.inscription ? 'Avec inscription' : 'Sans inscription'}
					</span>

					<span class="truncate text-sm">
						{event.highlight || '—'}
					</span>
				</button>
			{/if}
		</div>

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
			class="overflow-hidden border-t border-base-300 bg-base-200/30"
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
				{:else}
					<!-- Détails d'un événement existant -->
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#if event.location}
							<div>
								<p class="text-xs text-base-content/50">Lieu</p>
								<p>{event.location}</p>
							</div>
						{/if}

						{#if event.genre}
							<div>
								<p class="text-xs text-base-content/50">Genre</p>
								<p>{event.genre}</p>
							</div>
						{/if}

						{#if event.actionType}
							<div>
								<p class="text-xs text-base-content/50">Type d'action</p>
								<p>{event.actionType}</p>
							</div>
						{/if}

						{#if event.providers}
							<div>
								<p class="text-xs text-base-content/50">Prestataires</p>
								<p>{event.providers}</p>
							</div>
						{/if}

						{#if event.partner}
							<div>
								<p class="text-xs text-base-content/50">Partenaire</p>
								<p>{event.partner}</p>
							</div>
						{/if}

						{#if event.amount}
							<div>
								<p class="text-xs text-base-content/50">Montant</p>
								<p>{event.amount}</p>
							</div>
						{/if}
					</div>

					{#if event.description}
						<div class="mt-4">
							<p class="text-xs text-base-content/50">Description générale</p>
							<p class="whitespace-pre-line">{event.description}</p>
						</div>
					{/if}

					{#if event.comment}
						<div class="mt-4">
							<p class="text-xs text-base-content/50">Commentaire</p>
							<p class="whitespace-pre-line">{event.comment}</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	{/if}
</article>
