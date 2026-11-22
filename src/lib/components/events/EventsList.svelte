<script>
	import EventRow from '#lib/components/events/EventRow.svelte';

	/**
	 * @type {{
	 *   events: import('#lib/utils/types.js').ManagedEvent[],
	 *   selectedIds: string[],
	 *   draftId?: string | null,
	 *   onDraftChange?: (field: string, value: any) => void
	 * }}
	 */
	let {
		events = [],
		selectedIds = $bindable([]),
		draftId = null,
		onDraftChange = () => {}
	} = $props();

	/** @type {string[]} */
	let expandedIds = $state([]);

	// Ouvre automatiquement le brouillon dès qu'il apparaît.
	$effect(() => {
		if (draftId && !expandedIds.includes(draftId)) {
			expandedIds = [...expandedIds, draftId];
		}
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

<div class="flex flex-col gap-2">
	{#each events as event (event.id)}
		<EventRow
			{event}
			isExpanded={expandedIds.includes(event.id)}
			isSelected={selectedIds.includes(event.id)}
			isDraft={event.id === draftId}
			onToggle={() => toggleExpanded(event.id)}
			onToggleSelection={() => toggleSelection(event.id)}
			{onDraftChange}
		/>
	{/each}
</div>
