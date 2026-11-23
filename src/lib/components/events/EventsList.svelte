<script>
	import EventRow from '#lib/components/events/EventRow.svelte';

	/**
	 * @type {{
	 *   events: import('#lib/utils/types.js').ManagedEvent[],
	 *   selectedIds: string[],
	 *   draftId?: string | null,
	 *   onEdit?: (event: import('#lib/utils/types.js').ManagedEvent) => void,
	 *   onDraftChange?: (field: string, value: any) => void,
	 *   onDraftSave?: () => void,
	 *   onDraftCancel?: () => void,
	 *   draftError?: string,
	 *   isSavingDraft?: boolean
	 * }}
	 */
	let {
		events = [],
		selectedIds = $bindable([]),
		draftId = null,
		onEdit = () => {},
		onDraftChange = () => {},
		onDraftSave = () => {},
		onDraftCancel = () => {},
		draftError = '',
		isSavingDraft = false
	} = $props();

	/** @type {string[]} */
	let expandedIds = $state([]);

	/** @type {string | null} */
	let lastDraftId = $state(null);

	$effect(() => {
		if (draftId && draftId !== lastDraftId) {
			expandedIds = [...expandedIds, draftId];
			lastDraftId = draftId;
		} else if (!draftId) {
			lastDraftId = null;
		}
	});

	/**
	 * Regroupe les événements par mois et année.
	 * Les événements sans date sont placés en premier.
	 */
	let groupedEvents = $derived.by(() => {
		const undatedEvents = events.filter((event) => !event.startDate);

		// On conserve la date dans une propriété dont le type est garanti comme string.
		const datedEvents = events
			.flatMap((event) => (event.startDate ? [{ event, startDate: event.startDate }] : []))
			.toSorted((a, b) => a.startDate.localeCompare(b.startDate));

		/** @type {{ key: string, label: string, events: typeof events }[]} */
		const groups = [];

		// Événements sans date
		if (undatedEvents.length > 0) {
			groups.push({
				key: 'undated',
				label: 'Date non renseignée',
				events: undatedEvents
			});
		}

		// Événements datés, regroupés par mois
		for (const item of datedEvents) {
			const event = item.event;
			const monthKey = item.startDate.slice(0, 7);

			let group = groups.find((item) => item.key === monthKey);

			if (!group) {
				const date = new Date(`${item.startDate}T12:00:00`);

				const monthLabel = new Intl.DateTimeFormat('fr-FR', {
					month: 'long',
					year: 'numeric'
				}).format(date);

				group = {
					key: monthKey,
					label: monthLabel.charAt(0).toLocaleUpperCase('fr-FR') + monthLabel.slice(1),
					events: []
				};

				groups.push(group);
			}

			group.events.push(event);
		}

		return groups;
	});

	/**
	 * Ouvre ou ferme une ligne.
	 * @param {string} eventId
	 */
	function toggleExpanded(eventId) {
		expandedIds = expandedIds.includes(eventId)
			? expandedIds.filter((id) => id !== eventId)
			: [...expandedIds, eventId];
	}

	/**
	 * Sélectionne ou désélectionne un événement.
	 * @param {string} eventId
	 */
	function toggleSelection(eventId) {
		selectedIds = selectedIds.includes(eventId)
			? selectedIds.filter((id) => id !== eventId)
			: [...selectedIds, eventId];
	}
</script>

<div class="flex flex-col gap-6">
	{#each groupedEvents as group (group.key)}
		<section class="flex flex-col gap-2" aria-label={group.label}>
			<div class="flex items-center gap-3 pt-2">
				<h2 class="text-lg font-semibold">{group.label}</h2>
				<div class="h-px flex-1 bg-base-300"></div>
				<span class="text-sm text-base-content/50">{group.events.length}</span>
			</div>

			<div class="flex flex-col gap-2">
				{#each group.events as event (event.id)}
					<EventRow
						{event}
						isExpanded={expandedIds.includes(event.id)}
						isSelected={selectedIds.includes(event.id)}
						isDraft={event.id === draftId}
						onToggle={() => toggleExpanded(event.id)}
						onToggleSelection={() => toggleSelection(event.id)}
						onEdit={() => onEdit(event)}
						{onDraftChange}
						{onDraftSave}
						{onDraftCancel}
						{draftError}
						{isSavingDraft}
					/>
				{/each}
			</div>
		</section>
	{/each}
</div>
