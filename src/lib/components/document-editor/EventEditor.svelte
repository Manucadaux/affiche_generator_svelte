<script>
	// @ts-nocheck
	import { getEventImage } from '#lib/utils/imageStorage.js';

	import EditableField from '#lib/components/ui/EditableField.svelte';

	let { event, onUpdateEvent, onChangeImage, onBeginEdit, onEndEdit, onClose } = $props();

	let imageUrl = $state(null);
	let imageError = $state('');
	let currentObjectUrl = null;
	let eventId = $derived(event.id);
	let imageVersion = $derived(event.imageVersion ?? 0);

	function update(field, value) {
		onUpdateEvent(event.id, field, value);
	}

	// Charger l'image existante
	$effect(() => {
		const currentEventId = eventId;
		const currentImageVersion = imageVersion;
		let cancelled = false;

		imageUrl = null;

		getEventImage(currentEventId)
			.then((blob) => {
				if (cancelled || currentImageVersion !== imageVersion || !blob) return;

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
			await onChangeImage(event.id, file);
			imageError = '';
		} catch (error) {
			console.error('Erreur lors de l’enregistrement de l’image :', error);
			imageError = 'Impossible d’enregistrer cette image.';
		}
	}
</script>

<div class="card-body gap-4 p-6">
	<!-- En-tête -->
	<div class="flex items-center justify-between border-b border-base-300 pb-3">
		<div>
			<h2 class="card-title text-xl">Modifier l'événement</h2>
		</div>

		<button class="btn btn-circle btn-ghost btn-sm" onclick={onClose} aria-label="Fermer l'éditeur">
			✕
		</button>
	</div>

	<!-- Informations -->
	<div class="space-y-3">
		<h3 class="text-base font-semibold">Informations</h3>

		<fieldset class="fieldset">
			<legend class="fieldset-legend">Titre</legend>
			<EditableField
				value={event.title}
				label="Titre"
				mode="always"
				inputClass="input input-bordered w-full"
				onInput={(value) => update('title', String(value))}
				{onBeginEdit}
				{onEndEdit}
			/>
		</fieldset>

		<div class="grid grid-cols-2 gap-3">
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Date</legend>
				<EditableField
					value={event.date}
					label="Date"
					mode="always"
					inputClass="input input-bordered w-full"
					onInput={(value) => update('date', String(value))}
					{onBeginEdit}
					{onEndEdit}
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">Horaire</legend>
				<EditableField
					value={event.hour}
					label="Horaire"
					mode="always"
					multiline
					rows={2}
					inputClass="textarea textarea-bordered w-full"
					onInput={(value) => update('hour', String(value))}
					{onBeginEdit}
					{onEndEdit}
				/>
			</fieldset>
		</div>

		<fieldset class="fieldset">
			<legend class="fieldset-legend">Description</legend>
			<EditableField
				value={event.content}
				label="Description"
				mode="always"
				multiline
				inputClass="textarea textarea-bordered min-h-28 w-full"
				onInput={(value) => update('content', String(value))}
				{onBeginEdit}
				{onEndEdit}
			/>
		</fieldset>
	</div>

	<div class="divider my-0"></div>

	<!-- Présentation -->
	<div class="space-y-3">
		<h3 class="text-base font-semibold">Présentation</h3>

		<div class="grid grid-cols-2 gap-3">
			<fieldset class="fieldset">
				<legend class="fieldset-legend">Taille du titre</legend>
				<EditableField
					value={event.sizeTitle}
					label="Taille du titre"
					mode="always"
					inputType="number"
					min={1}
					inputClass="input input-bordered w-full"
					onInput={(value) => update('sizeTitle', Math.max(1, Number(value)))}
					{onBeginEdit}
					{onEndEdit}
				/>
			</fieldset>

			<fieldset class="fieldset">
				<legend class="fieldset-legend">Taille du texte</legend>
				<EditableField
					value={event.sizeDescription}
					label="Taille du texte"
					mode="always"
					inputType="number"
					min={1}
					inputClass="input input-bordered w-full"
					onInput={(value) => update('sizeDescription', Math.max(1, Number(value)))}
					{onBeginEdit}
					{onEndEdit}
				/>
			</fieldset>
		</div>
	</div>

	<div class="divider my-0"></div>

	<!-- Conditions -->
	<div class="space-y-3">
		<h3 class="text-base font-semibold">Conditions</h3>

		<fieldset class="fieldset">
			<legend class="fieldset-legend">Public concerné</legend>
			<EditableField
				value={event.condition}
				label="Public concerné"
				mode="always"
				inputClass="input input-bordered w-full"
				onInput={(value) => update('condition', String(value))}
				{onBeginEdit}
				{onEndEdit}
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
	</div>

	<div class="divider my-0"></div>

	<!-- Image -->
	<div class="space-y-3">
		<h3 class="text-base font-semibold">Image</h3>

		{#if imageUrl}
			<div class="space-y-3">
				<div class="overflow-hidden rounded-lg border border-base-300">
					<img
						src={imageUrl}
						alt={event.title || 'Événement'}
						class="max-h-52 w-full object-contain"
					/>
				</div>

				<label class="btn w-full btn-outline btn-sm">
					Remplacer l'image
					<input type="file" accept="image/*" class="hidden" onchange={handleImageChange} />
				</label>
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
</div>
