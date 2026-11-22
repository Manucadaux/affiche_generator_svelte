<script>
	import { onMount } from 'svelte';

	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { getAllEvents } from '#lib/utils/events/eventStorage.js';
	import { subscribeToEventChanges } from '#lib/utils/events/eventSync.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';
	import { createManagedEvent } from '#lib/utils/events/eventFactory.js';

	import AppHeader from '#lib/components/layout/AppHeader.svelte';
	import AppFooter from '#lib/components/layout/AppFooter.svelte';
	import EmptyEvents from '#lib/components/events/EmptyEvents.svelte';
	import EventsToolbar from '#lib/components/events/EventsToolbar.svelte';
	import EventsList from '#lib/components/events/EventsList.svelte';

	const selectedTheme = useLocalStorage('selectedTheme', 'system');

	applyTheme(selectedTheme);

	const activeLibraryId = useLocalStorage(
		'newDocumentLibraryId',
		/** @type {number | null} */ (null)
	);

	/** @type {import('#lib/utils/types.js').ManagedEvent[]} */
	let events = $state([]);

	let isInitialized = $state(false);
	let initializationError = $state('');

	let isEditMode = $state(false);

	/** @type {import('#lib/utils/types.js').ManagedEvent | null} */
	let newEventDraft = $state(null);

	/** @type {string[]} */
	let selectedEventIds = $state([]);

	let searchQuery = $state('');
	let selectedLibraryId = $state('all');
	let selectedSection = $state('all');
	let selectedMonth = $state('all');
	let selectedYear = $state('all');
	let selectedInscription = $state('all');
	let selectedGenre = $state('all');
	let selectedActionType = $state('all');
	let showIncompleteOnly = $state(false);

	/**
	 * Recharge la liste des événements depuis IndexedDB.
	 * @returns {Promise<void>}
	 */
	async function refreshEvents() {
		events = await getAllEvents();
	}

	/**
	 * Initialise un nouveau brouillon d'événement.
	 * La médiathèque active est utilisée si elle est définie.
	 */
	function startNewEventDraft() {
		newEventDraft = createManagedEvent({
			libraryId: activeLibraryId.current
		});
	}

	function handleStartEditing() {
		isEditMode = true;

		if (!newEventDraft) {
			startNewEventDraft();
		}
	}

	function handleToggleEdit() {
		if (isEditMode) {
			isEditMode = false;
			newEventDraft = null;
			return;
		}

		isEditMode = true;
		startNewEventDraft();
	}

	/**
	 * Met à jour un champ du brouillon.
	 * @param {string} field
	 * @param {any} value
	 */
	function updateNewEventDraft(field, value) {
		if (!newEventDraft) return;

		newEventDraft = {
			...newEventDraft,
			[field]: value
		};
	}

	let genreOptions = $derived(
		[...new Set(events.map((event) => event.genre.trim()).filter(Boolean))].sort()
	);

	let actionTypeOptions = $derived(
		[...new Set(events.map((event) => event.actionType.trim()).filter(Boolean))].sort()
	);

	let filteredEvents = $derived(
		events.filter((event) => {
			// Recherche textuelle
			const query = searchQuery.trim().toLocaleLowerCase('fr');

			const searchableText = [
				event.title,
				event.description,
				event.location,
				event.genre,
				event.highlight,
				event.providers,
				event.partner,
				event.actionType
			]
				.join(' ')
				.toLocaleLowerCase('fr');

			if (query && !searchableText.includes(query)) return false;

			// Médiathèque
			if (selectedLibraryId !== 'all' && event.libraryId !== Number(selectedLibraryId)) {
				return false;
			}

			// Section
			if (selectedSection !== 'all' && event.section !== selectedSection) {
				return false;
			}

			// Mois et année de début
			const eventMonth = event.startDate?.slice(5, 7);
			const eventYear = event.startDate?.slice(0, 4);

			if (selectedMonth !== 'all' && eventMonth !== selectedMonth) {
				return false;
			}

			if (selectedYear !== 'all' && eventYear !== selectedYear) {
				return false;
			}

			// Inscription
			if (selectedInscription === 'yes' && !event.inscription) {
				return false;
			}

			if (selectedInscription === 'no' && event.inscription) {
				return false;
			}

			// Genre et type d'action
			if (selectedGenre !== 'all' && event.genre !== selectedGenre) {
				return false;
			}

			if (selectedActionType !== 'all' && event.actionType !== selectedActionType) {
				return false;
			}

			// Informations essentielles manquantes
			if (
				showIncompleteOnly &&
				event.title.trim() &&
				event.libraryId !== null &&
				event.startDate &&
				event.section &&
				event.description.trim()
			) {
				return false;
			}

			return true;
		})
	);

	// Le brouillon est toujours affiché en première position,
	// indépendamment des filtres actifs.
	let displayedEvents = $derived.by(() => {
		const draft = newEventDraft;

		return draft
			? [draft, ...filteredEvents.filter((event) => event.id !== draft.id)]
			: filteredEvents;
	});

	onMount(async () => {
		try {
			await refreshEvents();
			isInitialized = true;
		} catch (error) {
			console.error('Erreur lors du chargement des événements :', error);
			initializationError = 'Impossible de charger les événements.';
		}
	});

	onMount(() => {
		return subscribeToEventChanges(() => {
			refreshEvents().catch((error) => {
				console.error('Erreur lors de la synchronisation des événements :', error);
			});
		});
	});
</script>

<div class="flex min-h-screen flex-col">
	<AppHeader title="Gestionnaire d'événements" bind:selectedTheme={selectedTheme.current} />

	<main
		class="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
		data-mode={isEditMode ? 'edit' : 'read'}
	>
		{#if isInitialized && !initializationError}
			<EventsToolbar
				eventCount={events.length}
				bind:searchQuery
				bind:libraryId={selectedLibraryId}
				bind:section={selectedSection}
				bind:month={selectedMonth}
				bind:year={selectedYear}
				bind:inscription={selectedInscription}
				bind:genre={selectedGenre}
				bind:actionType={selectedActionType}
				bind:incomplete={showIncompleteOnly}
				{genreOptions}
				{actionTypeOptions}
				{isEditMode}
				onToggleEdit={handleToggleEdit}
			/>
		{/if}

		<section class="flex flex-1 flex-col" aria-label="Liste des événements">
			{#if initializationError}
				<div class="flex flex-1 items-center justify-center">
					<p class="text-error">{initializationError}</p>
				</div>
			{:else if !isInitialized}
				<div class="flex flex-1 items-center justify-center">
					<span class="loading loading-md loading-spinner" aria-label="Chargement"></span>
				</div>
			{:else if events.length === 0 && !newEventDraft}
				<div class="flex flex-1 items-center justify-center">
					<EmptyEvents onOpenCreate={handleStartEditing} />
				</div>
			{:else if displayedEvents.length === 0}
				<div class="flex flex-1 items-center justify-center">
					<p class="text-center text-base-content/60">
						Aucun événement ne correspond aux critères de recherche.
					</p>
				</div>
			{:else}
				<EventsList
					events={displayedEvents}
					bind:selectedIds={selectedEventIds}
					draftId={newEventDraft?.id ?? null}
					onDraftChange={updateNewEventDraft}
				/>
			{/if}
		</section>
	</main>

	<AppFooter />
</div>
