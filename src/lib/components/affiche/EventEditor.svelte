<script>
	// @ts-nocheck
	import { saveEventImage, getEventImage, deleteEventImage } from '#lib/utils/imageStorage.js';

	let { event, onUpdateEvent, onClose } = $props();

	let imageUrl = $state(null);
	let imageError = $state('');
	let currentObjectUrl = null;
	let eventId = $derived(event.id);

	function update(field, value) {
		onUpdateEvent(event.id, field, value);
	}

	// Charger l'image existante
	$effect(() => {
		const currentEventId = eventId;
		let cancelled = false;

		imageUrl = null;

		getEventImage(currentEventId)
			.then((blob) => {
				if (cancelled || !blob) return;

				const newUrl = URL.createObjectURL(blob);

				currentObjectUrl = newUrl;
				imageUrl = newUrl;
			})
			.catch((error) => {
				console.error('Erreur lors du chargement de l’image :', error);
			});

		return () => {
			cancelled = true;

			if (currentObjectUrl) {
				URL.revokeObjectURL(currentObjectUrl);
				currentObjectUrl = null;
			}
		};
	});

	// Choisir et enregistrer une nouvelle image
	async function handleImageChange(e) {
		const input = e.currentTarget;
		const file = input.files?.[0];

		if (!file) return;

		input.value = '';

		if (!file.type.startsWith('image/')) {
			imageError = 'Veuillez choisir un fichier image.';
			return;
		}

		try {
			await saveEventImage(event.id, file);

			// Mettre à jour l'image dans l'éditeur
			if (currentObjectUrl) {
				URL.revokeObjectURL(currentObjectUrl);
			}

			const newUrl = URL.createObjectURL(file);

			currentObjectUrl = newUrl;
			imageUrl = newUrl;
			imageError = '';

			// Signaler le changement à Event.svelte
			update('imageVersion', (event.imageVersion ?? 0) + 1);
		} catch (error) {
			console.error('Erreur lors de l’enregistrement de l’image :', error);
			imageError = 'Impossible d’enregistrer cette image.';
		}
	}

	// Supprimer l'image
	async function removeImage() {
		try {
			await deleteEventImage(event.id);

			if (currentObjectUrl) {
				URL.revokeObjectURL(currentObjectUrl);
				currentObjectUrl = null;
			}

			imageUrl = null;
			imageError = '';
		} catch (error) {
			console.error('Erreur lors de la suppression de l’image :', error);
			imageError = 'Impossible de supprimer cette image.';
		}
	}
</script>

<div class="card-body gap-5 p-6">
	<div class="flex items-center justify-between border-b border-base-300 pb-4">
		<div>
			<h2 class="card-title text-xl">Modifier l'événement</h2>
			<p class="text-sm text-base-content/60">Personnalise ton événement</p>
		</div>

		<button class="btn btn-circle btn-ghost btn-sm" onclick={onClose} aria-label="Fermer l'éditeur">
			✕
		</button>
	</div>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Titre</legend>
		<input
			class="input-bordered input w-full"
			value={event.title}
			oninput={(e) => update('title', e.currentTarget.value)}
		/>
	</fieldset>

	<div class="grid grid-cols-2 gap-3">
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Date</legend>
			<input
				class="input-bordered input w-full"
				value={event.date}
				oninput={(e) => update('date', e.currentTarget.value)}
			/>
		</fieldset>

		<fieldset class="fieldset">
			<legend class="fieldset-legend">Horaire</legend>
			<textarea
				class="textarea-bordered textarea w-full"
				rows="2"
				value={event.hour}
				oninput={(e) => update('hour', e.currentTarget.value)}></textarea>
		</fieldset>
	</div>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Description</legend>
		<textarea
			class="textarea-bordered textarea min-h-28 w-full"
			value={event.content}
			oninput={(e) => update('content', e.currentTarget.value)}></textarea>
	</fieldset>

	<div class="divider my-0">Typographie</div>

	<div class="grid grid-cols-2 gap-3">
		<fieldset class="fieldset">
			<legend class="fieldset-legend">Taille du titre</legend>
			<input
				class="input-bordered input w-full"
				type="number"
				min="1"
				value={event.sizeTitle}
				oninput={(e) => update('sizeTitle', Math.max(1, Number(e.currentTarget.value)))}
			/>
		</fieldset>

		<fieldset class="fieldset">
			<legend class="fieldset-legend">Taille du texte</legend>
			<input
				class="input-bordered input w-full"
				type="number"
				min="1"
				value={event.sizeDescription}
				oninput={(e) => update('sizeDescription', Math.max(1, Number(e.currentTarget.value)))}
			/>
		</fieldset>
	</div>

	<fieldset class="fieldset">
		<legend class="fieldset-legend">Public concerné</legend>
		<input
			class="input-bordered input w-full"
			value={event.condition}
			oninput={(e) => update('condition', e.currentTarget.value)}
		/>
	</fieldset>

	<div class="flex items-center justify-between rounded-lg bg-base-200 p-3">
		<span class="font-medium">Sur inscription</span>
		<input
			type="checkbox"
			class="checkbox checkbox-primary"
			checked={event.inscription}
			onchange={(e) => update('inscription', e.currentTarget.checked)}
		/>
	</div>

	<div class="divider my-0">Image</div>

	{#if imageUrl}
		<div class="space-y-3">
			<div class="overflow-hidden rounded-lg border border-base-300">
				<img
					src={imageUrl}
					alt={event.title || 'Événement'}
					class="max-h-52 w-full object-contain"
				/>
			</div>

			<div class="flex gap-2">
				<label class="btn flex-1 btn-outline btn-sm">
					Remplacer l'image
					<input type="file" accept="image/*" class="hidden" onchange={handleImageChange} />
				</label>

				<button class="btn btn-outline btn-error btn-sm" onclick={removeImage}> Supprimer </button>
			</div>
		</div>
	{:else}
		<label
			class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-base-300 p-8 transition hover:border-primary hover:bg-base-200"
		>
			<span class="text-3xl">+</span>
			<span class="font-medium">Ajouter une image</span>
			<span class="text-xs text-base-content/60">Clique pour choisir un fichier</span>

			<input type="file" accept="image/*" class="hidden" onchange={handleImageChange} />
		</label>
	{/if}

	{#if imageError}
		<p class="text-sm text-error">{imageError}</p>
	{/if}
</div>
