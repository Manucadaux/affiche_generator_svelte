<script>
	import { ChevronDown, ChevronRight } from '@lucide/svelte';
	import { optionsLibrary } from '#lib/data/options.js';

	/** @type {{
	 *   event: import('#lib/utils/types.js').ManagedEvent,
	 *   isExpanded: boolean,
	 *   isSelected: boolean,
	 *   onToggle: () => void,
	 *   onToggleSelection: () => void
	 * }} */
	let { event, isExpanded, isSelected, onToggle, onToggleSelection } = $props();

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
</script>

<article class="overflow-hidden rounded-box border border-base-300 bg-base-100">
	<div class="flex items-center gap-3 px-4 py-3">
		<input
			type="checkbox"
			class="checkbox checkbox-sm"
			checked={isSelected}
			onchange={onToggleSelection}
			aria-label={`Sélectionner ${event.title || 'cet événement'}`}
		/>

		<button
			type="button"
			class="grid flex-1 grid-cols-1 items-center gap-2 text-left sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.5fr)]"
			aria-expanded={isExpanded}
			onclick={onToggle}
		>
			<span class="font-medium">
				{event.title || 'Événement sans titre'}
			</span>

			<span class="text-sm text-base-content/70">
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
				{event.inscription ? 'Oui' : 'Non'}
			</span>

			<span class="flex items-center justify-between gap-2 text-sm">
				<span class="truncate">{event.highlight || '—'}</span>

				{#if isExpanded}
					<ChevronDown size={18} class="shrink-0" />
				{:else}
					<ChevronRight size={18} class="shrink-0" />
				{/if}
			</span>
		</button>
	</div>

	{#if isExpanded}
		<div class="border-t border-base-300 bg-base-200/30 px-4 py-4">
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
		</div>
	{/if}
</article>
