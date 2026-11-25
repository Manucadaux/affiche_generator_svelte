import { filterItems } from '../collections/filter.js';

/**
 * @typedef {Object} EventFilters
 * @property {number[]} [libraryIds] Médiathèques sélectionnées.
 * @property {import('../types.js').EventSection[]} [sections] Sections sélectionnées.
 * @property {string[]} [genres] Genres sélectionnés.
 * @property {number | null} [month] Mois sélectionné (1 à 12).
 * @property {number | null} [year] Année sélectionnée.
 * @property {boolean | null} [inscription] Avec ou sans inscription.
 * @property {boolean} [incomplete] Afficher uniquement les événements incomplets.
 */

/**
 * Déterminer si un événement manque d'informations essentielles.
 *
 * @param {import('../types.js').ManagedEvent} event
 * @returns {boolean}
 */
export function isEventIncomplete(event) {
	return (
		event.libraryId === null ||
		event.section === null ||
		!event.startDate ||
		!event.description.trim()
	);
}

/**
 * Filtrer les événements selon plusieurs critères indépendants.
 * Les valeurs sélectionnées dans une même catégorie fonctionnent en OU.
 * Les différentes catégories sont combinées en ET.
 *
 * @param {import('../types.js').ManagedEvent[]} events
 * @param {EventFilters} [filters]
 * @returns {import('../types.js').ManagedEvent[]}
 */
export function filterEvents(events, filters = {}) {
	const {
		libraryIds = [],
		sections = [],
		genres = [],
		month = null,
		year = null,
		inscription = null,
		incomplete = false
	} = filters;

	/** @type {Array<(event: import('../types.js').ManagedEvent) => boolean>} */
	const predicates = [];

	if (libraryIds.length > 0) {
		predicates.push((event) => event.libraryId !== null && libraryIds.includes(event.libraryId));
	}

	if (sections.length > 0) {
		predicates.push((event) => event.section !== null && sections.includes(event.section));
	}

	if (genres.length > 0) {
		const normalizedGenres = genres.map((genre) => genre.trim().toLocaleLowerCase('fr'));

		predicates.push((event) =>
			normalizedGenres.includes(event.genre.trim().toLocaleLowerCase('fr'))
		);
	}

	if (month !== null && year !== null) {
		const targetMonth = `${year}-${String(month).padStart(2, '0')}`;

		predicates.push((event) => event.startDate?.startsWith(targetMonth) ?? false);
	}

	if (inscription !== null) {
		predicates.push((event) => event.inscription === inscription);
	}

	if (incomplete) {
		predicates.push(isEventIncomplete);
	}

	return filterItems(events, predicates);
}
