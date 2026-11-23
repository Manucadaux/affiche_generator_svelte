<script>
	import { onMount } from 'svelte';

	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { addEvent, getAllEvents, updateEvent } from '#lib/utils/events/eventStorage.js';
	import { subscribeToEventChanges } from '#lib/utils/events/eventSync.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';
	import { createManagedEvent } from '#lib/utils/events/eventFactory.js';

	import AppHeader from '#lib/components/layout/AppHeader.svelte';
	import AppFooter from '#lib/components/layout/AppFooter.svelte';
	import EmptyEvents from '#lib/components/events/EmptyEvents.svelte';
	import EventsToolbar from '#lib/components/events/EventsToolbar.svelte';
	import EventsFilters from '#lib/components/events/EventsFilters.svelte';
	import EventsList from '#lib/components/events/EventsList.svelte';
	import NewEventModal from '#lib/components/events/NewEventModal.svelte';

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
	let showCreateModal = $state(false);
	let filtersOpen = $state(false);

	/** @type {import('#lib/utils/types.js').ManagedEvent | null} */
	let editingEvent = $state(null);

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
	 * Ouvre la modale de création.
	 */
	function handleOpenCreate() {
		editingEvent = null;
		showCreateModal = true;
	}

	/**
	 * Ouvre la modale en mode modification.
	 * @param {import('#lib/utils/types.js').ManagedEvent} event
	 */
	function handleOpenEdit(event) {
		editingEvent = event;
		showCreateModal = true;
	}

	/**
	 * Réinitialise tous les filtres.
	 * La recherche textuelle est volontairement conservée.
	 */
	function handleResetFilters() {
		selectedLibraryId = 'all';
		selectedSection = 'all';
		selectedMonth = 'all';
		selectedYear = 'all';
		selectedInscription = 'all';
		selectedGenre = 'all';
		selectedActionType = 'all';
		showIncompleteOnly = false;
	}

	/**
	 * Enregistre un nouvel événement ou les modifications d'un événement existant.
	 * @param {Omit<import('#lib/utils/types.js').ManagedEvent, 'id' | 'createdAt' | 'updatedAt'>} eventData
	 */
	async function handleSaveEvent(eventData) {
		try {
			if (editingEvent) {
				const updatedEvent = {
					...editingEvent,
					...eventData,
					updatedAt: new Date().toISOString()
				};

				const wasUpdated = await updateEvent(updatedEvent);

				if (!wasUpdated) {
					console.error("L'événement n'existe plus et n'a pas pu être modifié.");
					return;
				}
			} else {
				const newEvent = createManagedEvent(eventData);
				await addEvent(newEvent);
			}

			showCreateModal = false;
			editingEvent = null;

			try {
				await refreshEvents();
			} catch (refreshError) {
				console.error(
					'Événement enregistré, mais impossible de rafraîchir la liste :',
					refreshError
				);
			}
		} catch (error) {
			console.error("Erreur lors de l'enregistrement de l'événement :", error);
		}
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

<div class="flex h-dvh flex-col overflow-hidden">
	<!-- Header principal -->
	<div class="shrink-0">
		<AppHeader title="Gestionnaire d'événements" bind:selectedTheme={selectedTheme.current} />
	</div>

	<!-- Zone de travail -->
	<main class="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
		<!-- Header de la liste : compteur, recherche et actions -->
		{#if isInitialized && !initializationError}
			<div class="shrink-0">
				<EventsToolbar
					eventCount={events.length}
					bind:searchQuery
					bind:filtersOpen
					libraryId={selectedLibraryId}
					section={selectedSection}
					month={selectedMonth}
					year={selectedYear}
					inscription={selectedInscription}
					genre={selectedGenre}
					actionType={selectedActionType}
					incomplete={showIncompleteOnly}
					onCreate={handleOpenCreate}
				/>
			</div>
		{/if}

		<!-- Liste et panneau de filtres -->
		<div class="flex min-h-0 flex-1 gap-4">
			<!-- Liste des événements : seule cette zone défile -->
			<section
				class="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain pr-2"
				aria-label="Liste des événements"
			>
				{#if initializationError}
					<div class="flex min-h-full items-center justify-center">
						<p class="text-error">{initializationError}</p>
					</div>
				{:else if !isInitialized}
					<div class="flex min-h-full items-center justify-center">
						<span class="loading loading-md loading-spinner" aria-label="Chargement"></span>
					</div>
				{:else if events.length === 0}
					<div class="flex min-h-full items-center justify-center">
						<EmptyEvents onOpenCreate={handleOpenCreate} />
					</div>
				{:else if filteredEvents.length === 0}
					<div class="flex min-h-full items-center justify-center">
						<p class="text-center text-base-content/60">
							Aucun événement ne correspond aux critères de recherche.
						</p>
					</div>
				{:else}
					<EventsList
						events={filteredEvents}
						bind:selectedIds={selectedEventIds}
						onEdit={handleOpenEdit}
					/>
				{/if}
			</section>

			<!-- Panneau de filtres : fixe à côté de la liste -->
			<aside
				id="events-filters-panel"
				class="h-full shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
				style={`width: ${filtersOpen ? '20rem' : '0'}`}
				aria-hidden={!filtersOpen}
			>
				{#if filtersOpen}
					<div
						class="h-full w-80 overflow-x-hidden overflow-y-auto overscroll-contain rounded-box border border-base-300 bg-base-200 p-4"
					>
						<EventsFilters
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
							onClose={() => (filtersOpen = false)}
							onReset={handleResetFilters}
						/>
					</div>
				{/if}
			</aside>
		</div>
	</main>

	<!-- Footer dans le flux normal, après la zone de travail -->
	<div class="shrink-0">
		<AppFooter />
	</div>
</div>

{#if showCreateModal}
	<NewEventModal
		initialLibraryId={activeLibraryId.current}
		eventToEdit={editingEvent}
		onClose={() => {
			showCreateModal = false;
			editingEvent = null;
		}}
		onSave={handleSaveEvent}
	/>
{/if}
