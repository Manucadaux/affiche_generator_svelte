import { searchItems } from '../collections/search.js';

/**
 * Construire le texte utilisé pour rechercher un événement.
 *
 * @param {import('../types.js').ManagedEvent} event
 * @param {(libraryId: number | null) => string} getLibraryName
 * @returns {string}
 */
export function getEventSearchText(event, getLibraryName = () => '') {
	return [
		event.title,
		getLibraryName(event.libraryId),
		event.section,
		event.highlight,
		event.condition,
		event.partner,
		event.genre,
		event.providers,
		event.description,
		event.posterDescription,
		event.bookletDescription,
		event.onlineDescription,
		event.comment
	]
		.filter(Boolean)
		.join(' ');
}

/**
 * Rechercher dans une collection d'événements.
 *
 * @param {import('../types.js').ManagedEvent[]} events
 * @param {string} query
 * @param {(libraryId: number | null) => string} [getLibraryName]
 * @returns {import('../types.js').ManagedEvent[]}
 */
export function searchEvents(events, query, getLibraryName = () => '') {
	return searchItems(events, query, (event) => getEventSearchText(event, getLibraryName));
}
