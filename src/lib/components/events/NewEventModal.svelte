<script>
	/** @typedef {import('../../utils/types.js').ManagedEvent} ManagedEvent */
	/** @typedef {import('../../utils/types.js').EventTimeSlot} EventTimeSlot */
	/** @typedef {import('../../utils/types.js').EventSection} EventSection */

	import { Plus, Trash2 } from 'lucide-svelte';
	import Modal from '#lib/components/ui/Modal.svelte';
	import { optionsLibrary } from '#lib/data/options.js';

	/**
	 * @typedef {'title' | 'location' | 'condition' | 'description' | 'posterDescription' | 'bookletDescription' | 'onlineDescription' | 'highlight' | 'genre' | 'providers' | 'amount' | 'actionType' | 'partner' | 'comment'} TextFieldName
	 */

	/**
	 * @typedef {{
	 *   kind: 'text' | 'textarea',
	 *   name: TextFieldName,
	 *   label: string,
	 *   placeholder: string,
	 *   required?: boolean
	 * }} TextField
	 */

	/** @typedef {{kind: 'library', label: string}} LibraryField */
	/** @typedef {{kind: 'section', label: string, options: EventSection[]}} SectionField */
	/** @typedef {TextField | LibraryField | SectionField} FormField */

	/**
	 * @typedef {{
	 *   title: string,
	 *   type: 'fields' | 'schedule' | 'registration',
	 *   fields?: FormField[]
	 * }} FormSection
	 */

	/**
	 * @typedef {Object} EventFormData
	 * @property {string} title
	 * @property {number | null} libraryId
	 * @property {string} location
	 * @property {import('../../utils/types.js').EventSection} section
	 * @property {string} condition
	 * @property {string} startDate
	 * @property {string | null} endDate
	 * @property {EventTimeSlot[]} timeSlots
	 * @property {string} description
	 * @property {string} posterDescription
	 * @property {string} bookletDescription
	 * @property {string} onlineDescription
	 * @property {string} highlight
	 * @property {string} genre
	 * @property {string} providers
	 * @property {string} amount
	 * @property {string} actionType
	 * @property {string} partner
	 * @property {string} comment
	 * @property {boolean} inscription
	 */

	/**
	 * @type {{
	 *   onClose: () => void,
	 *   onCreate: (event: Omit<ManagedEvent, 'id' | 'createdAt' | 'updatedAt'>) => void
	 * }}
	 */
	let { onClose, onCreate } = $props();

	const eventSections = /** @type {EventSection[]} */ (['Tout public', 'Jeunesse', 'Adulte']);

	/** @type {EventFormData} */
	let formData = $state({
		title: '',
		libraryId: null,
		location: '',
		section: 'Tout public',
		condition: '',
		startDate: '',
		endDate: null,
		timeSlots: [{ start: '', end: '' }],
		description: '',
		posterDescription: '',
		bookletDescription: '',
		onlineDescription: '',
		highlight: '',
		genre: '',
		providers: '',
		amount: '',
		actionType: '',
		partner: '',
		comment: '',
		inscription: false
	});

	/** @type {FormSection[]} */
	const formSections = [
		{
			title: 'Informations générales',
			type: 'fields',
			fields: [
				{
					kind: 'text',
					name: 'title',
					label: "Intitulé de l'événement",
					placeholder: "Nom de l'événement",
					required: true
				},
				{
					kind: 'library',
					label: 'Médiathèque'
				},
				{
					kind: 'text',
					name: 'location',
					label: "Lieu de l'événement",
					placeholder: "Lieu de l'événement"
				},
				{
					kind: 'section',
					label: 'Section',
					options: eventSections
				},
				{
					kind: 'text',
					name: 'condition',
					label: 'Public concerné',
					placeholder: 'Ex. : Tout public, à partir de 6 ans...'
				}
			]
		},
		{
			title: 'Inscription',
			type: 'registration'
		},
		{
			title: 'Dates et horaires',
			type: 'schedule'
		},
		{
			title: 'Descriptions',
			type: 'fields',
			fields: [
				{
					kind: 'textarea',
					name: 'description',
					label: 'Description générale',
					placeholder: "Description de l'événement..."
				},
				{
					kind: 'textarea',
					name: 'posterDescription',
					label: "Description pour l'affiche",
					placeholder: "Description destinée à l'affiche..."
				},
				{
					kind: 'textarea',
					name: 'bookletDescription',
					label: 'Description pour le livret',
					placeholder: 'Description destinée au livret...'
				},
				{
					kind: 'textarea',
					name: 'onlineDescription',
					label: "Description pour l'agenda en ligne",
					placeholder: "Description destinée à l'agenda en ligne..."
				}
			]
		},
		{
			title: 'Informations complémentaires',
			type: 'fields',
			fields: [
				{
					kind: 'text',
					name: 'highlight',
					label: 'Temps fort lié',
					placeholder: "Temps fort lié à l'événement"
				},
				{
					kind: 'text',
					name: 'genre',
					label: 'Genre',
					placeholder: 'Ex. : Exposition'
				},
				{
					kind: 'textarea',
					name: 'providers',
					label: 'Prestataires',
					placeholder: "Prestataires intervenant dans l'événement..."
				},
				{
					kind: 'text',
					name: 'amount',
					label: 'Montant (frais annexes compris)',
					placeholder: 'Ex. : 150 €, gratuit, 100 € + frais de déplacement...'
				},
				{
					kind: 'text',
					name: 'actionType',
					label: "Type d'action",
					placeholder: "Type d'action"
				},
				{
					kind: 'text',
					name: 'partner',
					label: 'Partenaire',
					placeholder: "Partenaire associé à l'événement"
				},
				{
					kind: 'textarea',
					name: 'comment',
					label: 'Commentaire',
					placeholder: 'Commentaire interne...'
				}
			]
		}
	];

	function addTimeSlot() {
		formData.timeSlots = [...formData.timeSlots, { start: '', end: '' }];
	}

	/** @param {number} index */
	function removeTimeSlot(index) {
		if (formData.timeSlots.length <= 1) return;

		formData.timeSlots = formData.timeSlots.filter((_, i) => i !== index);
	}

	/** @param {SubmitEvent} event */
	function handleSubmit(event) {
		event.preventDefault();

		const libraryId = formData.libraryId;

		if (libraryId === null) return;

		onCreate({
			...formData,
			title: formData.title.trim(),
			libraryId,
			location: formData.location.trim(),
			condition: formData.condition.trim(),
			endDate: formData.endDate || null,
			timeSlots: formData.timeSlots.map((slot) => ({
				start: slot.start,
				end: slot.end
			})),
			description: formData.description.trim(),
			posterDescription: formData.posterDescription.trim(),
			bookletDescription: formData.bookletDescription.trim(),
			onlineDescription: formData.onlineDescription.trim(),
			highlight: formData.highlight.trim(),
			genre: formData.genre.trim(),
			providers: formData.providers.trim(),
			amount: formData.amount.trim(),
			actionType: formData.actionType.trim(),
			partner: formData.partner.trim(),
			comment: formData.comment.trim()
		});
	}
</script>

<Modal title="Nouvel événement" size="xl" {onClose}>
	<form onsubmit={handleSubmit}>
		<div class="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
			{#each formSections as section, sectionIndex (section.title)}
				{#if sectionIndex > 0}
					<div class="divider my-0"></div>
				{/if}

				<section class="space-y-4">
					<h3 class="font-semibold">{section.title}</h3>

					{#if section.type === 'fields'}
						{#each section.fields ?? [] as field (field.kind === 'library' ? 'library' : field.kind === 'section' ? 'section' : field.name)}
							<div class="form-control">
								<label
									class="label"
									for="event-{field.kind === 'library'
										? 'library'
										: field.kind === 'section'
											? 'section'
											: field.name}"
								>
									<span class="label-text">
										{field.label}{'required' in field && field.required ? ' *' : ''}
									</span>
								</label>

								{#if field.kind === 'library'}
									<select
										id="event-library"
										class="select-bordered select w-full"
										bind:value={formData.libraryId}
										required
									>
										<option value={null} disabled>Choisir une médiathèque</option>
										{#each optionsLibrary as library (library.id)}
											<option value={library.id}>{library.label}</option>
										{/each}
									</select>
								{:else if field.kind === 'section'}
									<select
										id="event-section"
										class="select-bordered select w-full"
										bind:value={formData.section}
										required
									>
										{#each field.options as option (option)}
											<option value={option}>{option}</option>
										{/each}
									</select>
								{:else if field.kind === 'textarea'}
									<textarea
										id="event-{field.name}"
										class="textarea-bordered textarea min-h-24 w-full"
										placeholder={field.placeholder}
										bind:value={formData[field.name]}
										required={field.required ?? false}></textarea>
								{:else}
									<input
										id="event-{field.name}"
										type="text"
										class="input-bordered input w-full"
										placeholder={field.placeholder}
										bind:value={formData[field.name]}
										required={field.required ?? false}
									/>
								{/if}
							</div>
						{/each}
					{:else if section.type === 'schedule'}
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div class="form-control">
								<label class="label" for="event-start-date">
									<span class="label-text">Date de début *</span>
								</label>
								<input
									id="event-start-date"
									type="date"
									class="input-bordered input w-full"
									bind:value={formData.startDate}
									required
								/>
							</div>

							<div class="form-control">
								<label class="label" for="event-end-date">
									<span class="label-text">Date de fin</span>
								</label>
								<input
									id="event-end-date"
									type="date"
									class="input-bordered input w-full"
									bind:value={formData.endDate}
									min={formData.startDate || undefined}
								/>
							</div>
						</div>

						{#if !formData.endDate}
							<div class="space-y-3">
								<div class="flex items-center justify-between">
									<h4 class="text-sm font-medium">Créneaux horaires</h4>
									<button type="button" class="btn btn-ghost btn-sm" onclick={addTimeSlot}>
										<Plus size={16} />
										Ajouter un créneau
									</button>
								</div>

								{#each formData.timeSlots as slot, index (slot)}
									<div class="flex items-end gap-2">
										<div class="grid flex-1 grid-cols-2 gap-3">
											<div class="form-control">
												<label class="label" for="event-time-start-{index}">
													<span class="label-text text-xs">Début *</span>
												</label>
												<input
													id="event-time-start-{index}"
													type="time"
													class="input-bordered input w-full input-sm"
													bind:value={slot.start}
													required
												/>
											</div>

											<div class="form-control">
												<label class="label" for="event-time-end-{index}">
													<span class="label-text text-xs">Fin</span>
												</label>
												<input
													id="event-time-end-{index}"
													type="time"
													class="input-bordered input w-full input-sm"
													bind:value={slot.end}
												/>
											</div>
										</div>

										<button
											type="button"
											class="btn btn-square btn-ghost text-error btn-sm"
											aria-label="Supprimer ce créneau"
											title="Supprimer ce créneau"
											disabled={formData.timeSlots.length === 1}
											onclick={() => removeTimeSlot(index)}
										>
											<Trash2 size={16} />
										</button>
									</div>
								{/each}
							</div>
						{/if}
					{:else if section.type === 'registration'}
						<div class="flex flex-wrap gap-6">
							<label class="label cursor-pointer gap-2">
								<input
									type="radio"
									name="event-inscription"
									class="radio radio-primary"
									bind:group={formData.inscription}
									value={true}
								/>
								<span class="label-text">Inscription nécessaire</span>
							</label>

							<label class="label cursor-pointer gap-2">
								<input
									type="radio"
									name="event-inscription"
									class="radio radio-primary"
									bind:group={formData.inscription}
									value={false}
								/>
								<span class="label-text">Sans inscription</span>
							</label>
						</div>
					{/if}
				</section>
			{/each}
		</div>

		<footer class="mt-6 flex justify-end gap-2">
			<button type="button" class="btn btn-ghost" onclick={onClose}> Annuler </button>

			<button type="submit" class="btn btn-primary"> Créer l'événement </button>
		</footer>
	</form>
</Modal>
