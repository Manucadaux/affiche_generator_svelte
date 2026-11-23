<script>
	import { slide } from 'svelte/transition';
	import { ChevronDown } from '@lucide/svelte';
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

	/** @type {string[]} */
	let collapsedGroupIds = $state([]);

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

		const datedEvents = events
			.flatMap((event) => (event.startDate ? [{ event, startDate: event.startDate }] : []))
			.toSorted((a, b) => a.startDate.localeCompare(b.startDate));

		/** @type {{ key: string, label: string, events: typeof events }[]} */
		const groups = [];

		if (undatedEvents.length > 0) {
			groups.push({
				key: 'undated',
				label: 'Date non renseignée',
				events: undatedEvents
			});
		}

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
	 * Ouvre ou ferme une section de mois.
	 * @param {string} groupId
	 */
	function toggleGroup(groupId) {
		collapsedGroupIds = collapsedGroupIds.includes(groupId)
			? collapsedGroupIds.filter((id) => id !== groupId)
			: [...collapsedGroupIds, groupId];
	}

	/**
	 * Ouvre ou ferme une ligne d'événement.
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

	/**
	 * Indique si tous les événements d'un groupe sont sélectionnés.
	 * @param {import('#lib/utils/types.js').ManagedEvent[]} groupEvents
	 */
	function isGroupFullySelected(groupEvents) {
		return groupEvents.length > 0 && groupEvents.every((event) => selectedIds.includes(event.id));
	}

	/**
	 * Indique si une partie seulement des événements d'un groupe est sélectionnée.
	 * @param {import('#lib/utils/types.js').ManagedEvent[]} groupEvents
	 */
	function isGroupPartiallySelected(groupEvents) {
		const selectedCount = groupEvents.filter((event) => selectedIds.includes(event.id)).length;

		return selectedCount > 0 && selectedCount < groupEvents.length;
	}

	/**
	 * Sélectionne ou désélectionne tous les événements d'un groupe.
	 * Préserve les sélections des autres groupes.
	 * @param {import('#lib/utils/types.js').ManagedEvent[]} groupEvents
	 */
	function toggleGroupSelection(groupEvents) {
		const groupIds = groupEvents.map((event) => event.id);
		const allSelected = groupIds.every((id) => selectedIds.includes(id));

		if (allSelected) {
			selectedIds = selectedIds.filter((id) => !groupIds.includes(id));
		} else {
			selectedIds = [...new Set([...selectedIds, ...groupIds])];
		}
	}
</script>

<div class="flex flex-col gap-6">
	{#each groupedEvents as group (group.key)}
		{@const groupIsExpanded = !collapsedGroupIds.includes(group.key)}
		{@const groupIsFullySelected = isGroupFullySelected(group.events)}
		{@const groupIsPartiallySelected = isGroupPartiallySelected(group.events)}

		<section class="flex flex-col gap-2" aria-label={group.label}>
			<div class="flex items-center gap-3 pt-2">
				<input
					type="checkbox"
					class="checkbox checkbox-sm"
					checked={groupIsFullySelected}
					indeterminate={groupIsPartiallySelected}
					aria-label={`Sélectionner tous les événements : ${group.label}`}
					onchange={() => toggleGroupSelection(group.events)}
				/>

				<h2 class="text-lg font-semibold">{group.label}</h2>

				<span class="text-sm text-base-content/50">
					{group.events.length}
					{group.events.length === 1 ? 'évènement' : 'évènements'}
				</span>

				<div class="h-px flex-1 bg-base-300"></div>

				<button
					type="button"
					class="btn btn-square btn-ghost btn-sm"
					aria-label={`${groupIsExpanded ? 'Replier' : 'Déplier'} ${group.label}`}
					aria-expanded={groupIsExpanded}
					aria-controls={`events-group-${group.key}`}
					onclick={() => toggleGroup(group.key)}
				>
					<ChevronDown
						size={20}
						class={`transition-transform duration-200 ${groupIsExpanded ? '' : '-rotate-90'}`}
					/>
				</button>
			</div>

			{#if groupIsExpanded}
				<div
					id={`events-group-${group.key}`}
					class="flex flex-col gap-2"
					transition:slide={{ duration: 200 }}
				>
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
			{/if}
		</section>
	{/each}
</div>
