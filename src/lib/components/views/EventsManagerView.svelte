<script>
	import { onMount } from 'svelte';

	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import {
		addEvent,
		getAllEvents,
		updateEvent,
		deleteEvent
	} from '#lib/utils/events/eventStorage.js';
	import { subscribeToEventChanges } from '#lib/utils/events/eventSync.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';
	import { createManagedEvent } from '#lib/utils/events/eventFactory.js';
	import { optionsLibrary } from '#lib/data/options.js';

	import AppHeader from '#lib/components/layout/AppHeader.svelte';
	import AppFooter from '#lib/components/layout/AppFooter.svelte';
	import EmptyEvents from '#lib/components/events/EmptyEvents.svelte';
	import EventsToolbar from '#lib/components/events/EventsToolbar.svelte';
	import EventsFilters from '#lib/components/events/EventsFilters.svelte';
	import EventsList from '#lib/components/events/EventsList.svelte';
	import NewEventModal from '#lib/components/events/NewEventModal.svelte';
	import EventsSelectionToolbar from '#lib/components/events/EventsSelectionToolbar.svelte';

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
	let showBulkEditModal = $state(false);
	let filtersOpen = $state(false);

	/** @type {import('#lib/utils/types.js').ManagedEvent | null} */
	let editingEvent = $state(null);

	/** @type {string[]} */
	let selectedEventIds = $state([]);

	let bulkSection = $state('__unchanged__');
	let bulkHighlight = $state('');

	let searchQuery = $state('');
	let selectedLibraryId = $state('all');
	let selectedSection = $state('all');
	let selectedMonth = $state('all');
	let selectedYear = $state('all');
	let selectedInscription = $state('all');
	let selectedGenre = $state('all');
	let selectedActionType = $state('all');
	let showIncompleteOnly = $state(false);

	let selectedSortBy = $state('date');
	let selectedSortDirection = $state('asc');

	/**
	 * Recharge la liste des événements depuis IndexedDB.
	 * @returns {Promise<void>}
	 */
	async function refreshEvents() {
		events = await getAllEvents();
	}

	function handleOpenCreate() {
		editingEvent = null;
		showCreateModal = true;
	}

	/**
	 * @param {import('#lib/utils/types.js').ManagedEvent} event
	 */
	function handleOpenEdit(event) {
		editingEvent = event;
		showCreateModal = true;
	}

	/**
	 * Réinitialise les filtres et les tris.
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
		selectedSortBy = 'date';
		selectedSortDirection = 'asc';
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

	/**
	 * Sélectionne tous les événements affichés, ou vide la sélection.
	 */
	/**
	 * Sélectionne tous les événements affichés.
	 */
	function handleSelectAll() {
		const visibleIds = sortedFilteredEvents.map((event) => event.id);
		selectedEventIds = [...new Set([...selectedEventIds, ...visibleIds])];
	}

	/**
	 * Vide entièrement la sélection.
	 */
	function handleDeselectAll() {
		selectedEventIds = [];
	}

	/**
	 * Ouvre la fenêtre de modification groupée.
	 */
	function handleOpenBulkEdit() {
		bulkSection = '__unchanged__';
		bulkHighlight = '';
		showBulkEditModal = true;
	}

	/**
	 * Applique les modifications aux événements sélectionnés.
	 */
	async function handleBulkEdit() {
		try {
			const selectedEvents = events.filter((event) => selectedEventIds.includes(event.id));

			if (selectedEvents.length === 0) {
				throw new Error('Aucun événement sélectionné.');
			}

			for (const event of selectedEvents) {
				// Récupère une version sans proxy Svelte.
				const plainEvent = $state.snapshot(event);

				const updatedEvent = {
					...plainEvent,
					...(bulkSection !== '__unchanged__' && {
						section: /** @type {import('#lib/utils/types.js').EventSection | null} */ (
							bulkSection === '__clear__' ? null : bulkSection
						)
					}),
					...(bulkHighlight.trim() && {
						highlight: bulkHighlight.trim()
					}),
					updatedAt: new Date().toISOString()
				};

				const wasUpdated = await updateEvent(updatedEvent);

				if (!wasUpdated) {
					throw new Error(`Impossible de modifier l'événement "${event.title}".`);
				}
			}

			await refreshEvents();

			showBulkEditModal = false;
		} catch (error) {
			console.error('Erreur lors de la modification groupée :', error);
		}
	}

	/**
	 * Duplique chaque événement sélectionné.
	 */
	async function handleDuplicateSelected() {
		try {
			const selectedEvents = events.filter((event) => selectedEventIds.includes(event.id));

			if (selectedEvents.length === 0) return;

			/** @type {string[]} */
			const duplicatedIds = [];

			for (const event of selectedEvents) {
				// Récupère une version sans proxy Svelte.
				const plainEvent = $state.snapshot(event);

				// Retire les informations qui doivent être régénérées.
				const eventData = Object.fromEntries(
					Object.entries(plainEvent).filter(
						([key]) => !['id', 'createdAt', 'updatedAt'].includes(key)
					)
				);

				const duplicatedEvent = createManagedEvent(eventData);

				await addEvent(duplicatedEvent);

				duplicatedIds.push(duplicatedEvent.id);
			}

			await refreshEvents();

			// Sélectionne les nouvelles copies.
			selectedEventIds = duplicatedIds;
		} catch (error) {
			console.error('Erreur lors de la duplication des événements :', error);
		}
	}

	/**
	 * Supprime les événements sélectionnés après confirmation.
	 */
	async function handleDeleteSelected() {
		const selectedEvents = events.filter((event) => selectedEventIds.includes(event.id));

		if (selectedEvents.length === 0) return;

		const confirmed = window.confirm(
			`Supprimer les ${selectedEvents.length} événement${selectedEvents.length > 1 ? 's' : ''} sélectionné${selectedEvents.length > 1 ? 's' : ''} ? Cette action est définitive.`
		);

		if (!confirmed) return;

		try {
			for (const event of selectedEvents) {
				await deleteEvent(event.id);
			}

			selectedEventIds = [];
			await refreshEvents();
		} catch (error) {
			console.error('Erreur lors de la suppression des événements :', error);
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

			if (selectedLibraryId !== 'all' && event.libraryId !== Number(selectedLibraryId)) {
				return false;
			}

			if (selectedSection !== 'all' && event.section !== selectedSection) {
				return false;
			}

			const eventMonth = event.startDate?.slice(5, 7);
			const eventYear = event.startDate?.slice(0, 4);

			if (selectedMonth !== 'all' && eventMonth !== selectedMonth) {
				return false;
			}

			if (selectedYear !== 'all' && eventYear !== selectedYear) {
				return false;
			}

			if (selectedInscription === 'yes' && !event.inscription) {
				return false;
			}

			if (selectedInscription === 'no' && event.inscription) {
				return false;
			}

			if (selectedGenre !== 'all' && event.genre !== selectedGenre) {
				return false;
			}

			if (selectedActionType !== 'all' && event.actionType !== selectedActionType) {
				return false;
			}

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

	/**
	 * Trie les événements selon le critère et le sens choisis.
	 */
	let sortedFilteredEvents = $derived.by(() => {
		const direction = selectedSortDirection === 'asc' ? 1 : -1;

		return filteredEvents.toSorted((a, b) => {
			let valueA = '';
			let valueB = '';

			if (selectedSortBy === 'date') {
				valueA = a.startDate ?? '';
				valueB = b.startDate ?? '';
			} else if (selectedSortBy === 'title') {
				valueA = a.title.trim();
				valueB = b.title.trim();
			} else if (selectedSortBy === 'library') {
				valueA = optionsLibrary.find((library) => library.id === a.libraryId)?.label ?? '';
				valueB = optionsLibrary.find((library) => library.id === b.libraryId)?.label ?? '';
			}

			const comparison = valueA.localeCompare(valueB, 'fr', {
				sensitivity: 'base',
				numeric: true
			});

			if (comparison !== 0) {
				return comparison * direction;
			}

			return a.title.localeCompare(b.title, 'fr', {
				sensitivity: 'base'
			});
		});
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

<div class="flex h-dvh flex-col overflow-hidden">
	<div class="shrink-0">
		<AppHeader title="Gestionnaire d'événements" bind:selectedTheme={selectedTheme.current} />
	</div>

	<main class="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
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

		<div class="flex min-h-0 flex-1 gap-4">
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
					<EventsSelectionToolbar
						selectedCount={selectedEventIds.length}
						totalCount={sortedFilteredEvents.length}
						onSelectAll={handleSelectAll}
						onDeselectAll={handleDeselectAll}
						onEdit={handleOpenBulkEdit}
						onCopy={() => {}}
						onDuplicate={handleDuplicateSelected}
						onDelete={handleDeleteSelected}
					/>

					<EventsList
						events={sortedFilteredEvents}
						bind:selectedIds={selectedEventIds}
						sortBy={selectedSortBy}
						sortDirection={selectedSortDirection}
						onEdit={handleOpenEdit}
					/>
				{/if}
			</section>

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
							bind:sortBy={selectedSortBy}
							bind:sortDirection={selectedSortDirection}
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

{#if showBulkEditModal}
	<div class="modal-open modal" role="presentation">
		<div class="modal-box flex flex-col gap-4">
			<h2 class="text-lg font-semibold">Modifier les événements sélectionnés</h2>

			<p class="text-sm text-base-content/60">
				{selectedEventIds.length} événement{selectedEventIds.length > 1 ? 's' : ''} concerné{selectedEventIds.length >
				1
					? 's'
					: ''}. Les champs laissés inchangés conserveront leurs valeurs actuelles.
			</p>

			<label class="form-control w-full">
				<span class="label-text mb-2">Section</span>
				<select class="select-bordered select w-full" bind:value={bulkSection}>
					<option value="__unchanged__">Ne pas modifier</option>
					<option value="Tout public">Tout public</option>
					<option value="Jeunesse">Jeunesse</option>
					<option value="Adulte">Adulte</option>
					<option value="__clear__">Effacer la section</option>
				</select>
			</label>

			<label class="form-control w-full">
				<span class="label-text mb-2">Temps fort</span>
				<input
					class="input-bordered input w-full"
					type="text"
					bind:value={bulkHighlight}
					placeholder="Laisser vide pour ne pas modifier"
				/>
			</label>

			<div class="modal-action">
				<button type="button" class="btn btn-ghost" onclick={() => (showBulkEditModal = false)}>
					Annuler
				</button>
				<button
					type="button"
					class="btn btn-primary"
					disabled={bulkSection === '__unchanged__' && !bulkHighlight.trim()}
					onclick={handleBulkEdit}
				>
					Appliquer
				</button>
			</div>
		</div>
		<button
			type="button"
			class="modal-backdrop"
			aria-label="Fermer la fenêtre"
			onclick={() => (showBulkEditModal = false)}
		></button>
	</div>
{/if}
