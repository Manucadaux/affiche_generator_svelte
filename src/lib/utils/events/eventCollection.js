import { filterEvents } from './eventFilters.js';
import { searchEvents } from './eventSearch.js';

/**
 * Comparer deux événements par date croissante.
 * Les événements sans date sont placés à la fin.
 * @param {import('../types.js').ManagedEvent} a
 * @param {import('../types.js').ManagedEvent} b
 * @returns {number}
 */
export function compareEventsByDateAsc(a, b) {
	if (!a.startDate) return b.startDate ? 1 : 0;
	if (!b.startDate) return -1;

	return a.startDate.localeCompare(b.startDate);
}

/**
 * Comparer deux événements par date décroissante.
 * Les événements sans date sont placés à la fin.
 * @param {import('../types.js').ManagedEvent} a
 * @param {import('../types.js').ManagedEvent} b
 * @returns {number}
 */
export function compareEventsByDateDesc(a, b) {
	if (!a.startDate) return b.startDate ? 1 : 0;
	if (!b.startDate) return -1;

	return b.startDate.localeCompare(a.startDate);
}

/**
 * Comparer deux événements par titre alphabétique.
 * @param {import('../types.js').ManagedEvent} a
 * @param {import('../types.js').ManagedEvent} b
 * @returns {number}
 */
export function compareEventsByTitle(a, b) {
	return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
}

/**
 * Comparer deux événements par médiathèque.
 * Les événements sans médiathèque sont placés à la fin.
 * @param {import('../types.js').ManagedEvent} a
 * @param {import('../types.js').ManagedEvent} b
 * @param {(libraryId: number | null) => string} getLibraryName
 * @returns {number}
 */
export function compareEventsByLibrary(a, b, getLibraryName) {
	if (a.libraryId === null) return b.libraryId !== null ? 1 : 0;
	if (b.libraryId === null) return -1;

	const nameA = getLibraryName(a.libraryId);
	const nameB = getLibraryName(b.libraryId);

	return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
}

/**
 * Comparer deux événements par date de dernière modification.
 * Les plus récemment modifiés apparaissent en premier.
 * @param {import('../types.js').ManagedEvent} a
 * @param {import('../types.js').ManagedEvent} b
 * @returns {number}
 */
export function compareEventsByUpdatedAt(a, b) {
	return b.updatedAt.localeCompare(a.updatedAt);
}

/**
 * Trier les événements selon le critère choisi.
 * @param {import('../types.js').ManagedEvent[]} events
 * @param {'date-asc' | 'date-desc' | 'title-asc' | 'library-asc' | 'updated-desc'} sortBy
 * @param {(libraryId: number | null) => string} [getLibraryName]
 * @returns {import('../types.js').ManagedEvent[]}
 */
export function sortEvents(events, sortBy = 'date-asc', getLibraryName = () => '') {
	/** @type {Record<string, (a: import('../types.js').ManagedEvent, b: import('../types.js').ManagedEvent) => number>} */
	const comparators = {
		'date-asc': compareEventsByDateAsc,
		'date-desc': compareEventsByDateDesc,
		'title-asc': compareEventsByTitle,
		'library-asc': (a, b) => compareEventsByLibrary(a, b, getLibraryName),
		'updated-desc': compareEventsByUpdatedAt
	};

	const compare = comparators[sortBy] ?? compareEventsByDateAsc;

	return [...events].sort(compare);
}

/**
 * Obtenir les événements visibles après recherche, filtrage et tri.
 *
 * @param {import('../types.js').ManagedEvent[]} events
 * @param {Object} [options]
 * @param {string} [options.query]
 * @param {Parameters<typeof filterEvents>[1]} [options.filters]
 * @param {'date-asc' | 'date-desc' | 'title-asc' | 'library-asc' | 'updated-desc'} [options.sortBy]
 * @param {(libraryId: number | null) => string} [options.getLibraryName]
 * @returns {import('../types.js').ManagedEvent[]}
 */
export function getVisibleEvents(events, options = {}) {
	const { query = '', filters = {}, sortBy = 'date-asc', getLibraryName = () => '' } = options;

	const searchedEvents = searchEvents(events, query, getLibraryName);
	const filteredEvents = filterEvents(searchedEvents, filters);

	return sortEvents(filteredEvents, sortBy, getLibraryName);
}
