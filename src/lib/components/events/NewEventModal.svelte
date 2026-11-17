<script>
	/** @typedef {import('../../utils/types.js').ManagedEvent} ManagedEvent */
	/** @typedef {import('../../utils/types.js').EventTimeSlot} EventTimeSlot */

	import { Plus, Trash2 } from 'lucide-svelte';
	import Modal from '#lib/components/ui/Modal.svelte';
	import { optionsLibrary } from '#lib/data/options.js';

	/**
	 * @type {{
	 *   onClose: () => void,
	 *   onCreate: (event: Omit<ManagedEvent, 'id' | 'createdAt' | 'updatedAt'>) => void
	 * }}
	 */
	let { onClose, onCreate } = $props();

	let title = $state('');
	let libraryId = $state(/** @type {number | null} */ (null));
	let location = $state('');
	let condition = $state('');
	let startDate = $state('');
	let endDate = $state('');

	/** @type {EventTimeSlot[]} */
	let timeSlots = $state([{ start: '', end: '' }]);

	let description = $state('');
	let posterDescription = $state('');
	let bookletDescription = $state('');
	let onlineDescription = $state('');
	let inscription = $state(false);

	function addTimeSlot() {
		timeSlots = [...timeSlots, { start: '', end: '' }];
	}

	/** @param {number} index */
	function removeTimeSlot(index) {
		if (timeSlots.length <= 1) return;

		timeSlots = timeSlots.filter((_, i) => i !== index);
	}

	/** @param {SubmitEvent} event */
	function handleSubmit(event) {
		event.preventDefault();

		if (libraryId === null) return;

		onCreate({
			title: title.trim(),
			libraryId,
			location: location.trim(),
			condition: condition.trim(),
			startDate,
			endDate: endDate || null,
			timeSlots: timeSlots.map((slot) => ({
				start: slot.start,
				end: slot.end
			})),
			description: description.trim(),
			posterDescription: posterDescription.trim(),
			bookletDescription: bookletDescription.trim(),
			onlineDescription: onlineDescription.trim(),
			inscription
		});
	}
</script>

<Modal title="Nouvel événement" size="xl" {onClose}>
	<form onsubmit={handleSubmit}>
		<div class="max-h-[70vh] space-y-6 overflow-y-auto pr-1">
			<!-- Informations générales -->
			<section class="space-y-4">
				<h3 class="font-semibold">Informations générales</h3>

				<div class="form-control">
					<label class="label" for="event-title">
						<span class="label-text">Intitulé de l'événement *</span>
					</label>
					<input
						id="event-title"
						type="text"
						class="input-bordered input w-full"
						placeholder="Nom de l'événement"
						bind:value={title}
						required
					/>
				</div>

				<div class="form-control">
					<label class="label" for="event-library">
						<span class="label-text">Médiathèque *</span>
					</label>
					<select
						id="event-library"
						class="select-bordered select w-full"
						bind:value={libraryId}
						required
					>
						<option value={null} disabled>Choisir une médiathèque</option>
						{#each optionsLibrary as library (library.id)}
							<option value={library.id}>{library.label}</option>
						{/each}
					</select>
				</div>

				<div class="form-control">
					<label class="label" for="event-location">
						<span class="label-text">Lieu de l'événement</span>
					</label>
					<input
						id="event-location"
						type="text"
						class="input-bordered input w-full"
						placeholder="Lieu de l'événement"
						bind:value={location}
					/>
				</div>

				<div class="form-control">
					<label class="label" for="event-condition">
						<span class="label-text">Public concerné</span>
					</label>
					<input
						id="event-condition"
						type="text"
						class="input-bordered input w-full"
						placeholder="Ex. : Tout public, à partir de 6 ans..."
						bind:value={condition}
					/>
				</div>
			</section>

			<div class="divider my-0"></div>

			<!-- Dates et horaires -->
			<section class="space-y-4">
				<h3 class="font-semibold">Dates et horaires</h3>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div class="form-control">
						<label class="label" for="event-start-date">
							<span class="label-text">Date de début *</span>
						</label>
						<input
							id="event-start-date"
							type="date"
							class="input-bordered input w-full"
							bind:value={startDate}
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
							bind:value={endDate}
							min={startDate || undefined}
						/>
					</div>
				</div>

				{#if !endDate}
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<h4 class="text-sm font-medium">Créneaux horaires</h4>
							<button type="button" class="btn btn-ghost btn-sm" onclick={addTimeSlot}>
								<Plus size={16} />
								Ajouter un créneau
							</button>
						</div>

						{#each timeSlots as slot, index (slot)}
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
									disabled={timeSlots.length === 1}
									onclick={() => removeTimeSlot(index)}
								>
									<Trash2 size={16} />
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<div class="divider my-0"></div>

			<!-- Descriptions -->
			<section class="space-y-4">
				<h3 class="font-semibold">Descriptions</h3>

				<div class="form-control">
					<label class="label" for="event-description">
						<span class="label-text">Description générale</span>
					</label>
					<textarea
						id="event-description"
						class="textarea-bordered textarea min-h-24 w-full"
						placeholder="Description de l'événement..."
						bind:value={description}></textarea>
				</div>

				<div class="form-control">
					<label class="label" for="event-poster-description">
						<span class="label-text">Description pour l'affiche</span>
					</label>
					<textarea
						id="event-poster-description"
						class="textarea-bordered textarea min-h-24 w-full"
						placeholder="Description destinée à l'affiche..."
						bind:value={posterDescription}></textarea>
				</div>

				<div class="form-control">
					<label class="label" for="event-booklet-description">
						<span class="label-text">Description pour le livret</span>
					</label>
					<textarea
						id="event-booklet-description"
						class="textarea-bordered textarea min-h-24 w-full"
						placeholder="Description destinée au livret..."
						bind:value={bookletDescription}></textarea>
				</div>

				<div class="form-control">
					<label class="label" for="event-online-description">
						<span class="label-text">Description pour l'agenda en ligne</span>
					</label>
					<textarea
						id="event-online-description"
						class="textarea-bordered textarea min-h-24 w-full"
						placeholder="Description destinée à l'agenda en ligne..."
						bind:value={onlineDescription}></textarea>
				</div>
			</section>

			<div class="divider my-0"></div>

			<!-- Inscription -->
			<section class="space-y-3">
				<h3 class="font-semibold">Inscription</h3>

				<div class="flex flex-wrap gap-6">
					<label class="label cursor-pointer gap-2">
						<input
							type="radio"
							name="event-inscription"
							class="radio radio-primary"
							bind:group={inscription}
							value={true}
						/>
						<span class="label-text">Inscription nécessaire</span>
					</label>

					<label class="label cursor-pointer gap-2">
						<input
							type="radio"
							name="event-inscription"
							class="radio radio-primary"
							bind:group={inscription}
							value={false}
						/>
						<span class="label-text">Sans inscription</span>
					</label>
				</div>
			</section>
		</div>

		<footer class="mt-6 flex justify-end gap-2">
			<button type="button" class="btn btn-ghost" onclick={onClose}> Annuler </button>

			<button type="submit" class="btn btn-primary"> Créer l'événement </button>
		</footer>
	</form>
</Modal>
