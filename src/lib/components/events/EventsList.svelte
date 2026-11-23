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
			onEdit={() => onEdit(event)}
			{onDraftChange}
			{onDraftSave}
			{onDraftCancel}
			{draftError}
			{isSavingDraft}
		/>
	{/each}
</div>
