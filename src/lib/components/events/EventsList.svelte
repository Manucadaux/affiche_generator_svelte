<script>
	import { slide } from 'svelte/transition';
	import { ChevronDown } from '@lucide/svelte';
	import EventRow from '#lib/components/events/EventRow.svelte';

	/** @type {(field: string, value: any) => void} */
	const noopDraftChange = () => {};

	/** @type {() => void} */
	const noopDraftSave = () => {};

	/** @type {() => void} */
	const noopDraftCancel = () => {};

	let {
		events = [],
		selectedIds = $bindable([]),
		draftId = null,
		sortBy = 'date',
		sortDirection = 'asc',
		onEdit = () => {},
		onDraftChange = noopDraftChange,
		onDraftSave = noopDraftSave,
		onDraftCancel = noopDraftCancel,
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

	// Regroupement mensuel uniquement pour le tri par date.
	let groupedEvents = $derived.by(() => {
		const undatedEvents = events.filter((event) => !event.startDate);
		const datedEvents = events.filter((event) => event.startDate);

		/** @type {{ key: string, label: string, events: typeof events }[]} */
		const groups = [];

		if (undatedEvents.length > 0) {
			groups.push({
				key: 'undated',
				label: 'Date non renseignée',
				events: undatedEvents
			});
		}

		for (const event of datedEvents) {
			const monthKey = event.startDate.slice(0, 7);

			let group = groups.find((item) => item.key === monthKey);

			if (!group) {
				const date = new Date(`${event.startDate}T12:00:00`);

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

		const undatedGroup = groups.filter((group) => group.key === 'undated');

		const datedGroups = groups
			.filter((group) => group.key !== 'undated')
			.toSorted((a, b) => {
				const comparison = a.key.localeCompare(b.key);
				return sortDirection === 'desc' ? -comparison : comparison;
			});

		return [...undatedGroup, ...datedGroups];
	});

	/** @param {string} groupId */
	function toggleGroup(groupId) {
		collapsedGroupIds = collapsedGroupIds.includes(groupId)
			? collapsedGroupIds.filter((id) => id !== groupId)
			: [...collapsedGroupIds, groupId];
	}

	/** @param {string} eventId */
	function toggleExpanded(eventId) {
		expandedIds = expandedIds.includes(eventId)
			? expandedIds.filter((id) => id !== eventId)
			: [...expandedIds, eventId];
	}

	/** @param {string} eventId */
	function toggleSelection(eventId) {
		selectedIds = selectedIds.includes(eventId)
			? selectedIds.filter((id) => id !== eventId)
			: [...selectedIds, eventId];
	}

	/**
	 * @param {import('#lib/utils/types.js').ManagedEvent[]} groupEvents
	 */
	function isGroupFullySelected(groupEvents) {
		return groupEvents.length > 0 && groupEvents.every((event) => selectedIds.includes(event.id));
	}

	/**
	 * @param {import('#lib/utils/types.js').ManagedEvent[]} groupEvents
	 */
	function isGroupPartiallySelected(groupEvents) {
		const selectedCount = groupEvents.filter((event) => selectedIds.includes(event.id)).length;
		return selectedCount > 0 && selectedCount < groupEvents.length;
	}

	/**
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

{#if sortBy === 'date'}
	<!-- Affichage regroupé par mois pour le tri par date -->
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
{:else}
	<!-- Affichage global pour le tri par nom ou médiathèque -->
	<div class="flex flex-col gap-2">
		{#each events as event (event.id)}
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
