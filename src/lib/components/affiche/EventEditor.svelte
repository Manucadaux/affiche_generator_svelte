<script>
	// @ts-nocheck
	let { event, onUpdateEvent, onClose } = $props();

	function update(field, value) {
		onUpdateEvent(event.id, field, value);
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
				oninput={(e) => update('sizeTitle', Number(e.currentTarget.value))}
			/>
		</fieldset>

		<fieldset class="fieldset">
			<legend class="fieldset-legend">Taille du texte</legend>
			<input
				class="input-bordered input w-full"
				type="number"
				min="1"
				value={event.sizeDescription}
				oninput={(e) => update('sizeDescription', Number(e.currentTarget.value))}
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
</div>
