/** @typedef {import('./types.js').AppDocument} AppDocument */
/** @typedef {import('./types.js').Page} Page */
/** @typedef {import('./types.js').Styles} Styles */

/**
 * @typedef {Object} LegacyDocumentData
 * @property {string} [name]
 * @property {number | null} [libraryId]
 * @property {number | null} [monthId]
 * @property {Page[]} pages
 * @property {Partial<Styles>} [styles]
 */

/**
 * Construit un document à partir des anciennes données du Generator.
 *
 * Cette fonction ne lit et n'écrit aucune donnée : elle transforme
 * uniquement les valeurs qu'on lui transmet.
 *
 * @param {Object} options
 * @param {LegacyDocumentData} options.legacyData
 * @param {() => string} options.generateId
 * @param {Styles} options.defaultStyles
 * @param {string} options.now
 * @returns {AppDocument}
 */
export function createLegacyDocument({ legacyData, generateId, defaultStyles, now }) {
	const { name, libraryId, monthId, pages, styles } = legacyData;

	return {
		id: generateId(),
		version: 1,
		name: name?.trim() || 'Mon document',
		libraryId: libraryId ?? null,
		monthId: monthId ?? null,
		pages: pages.map((page) => ({
			...page,
			events: page.events.map((event) => ({ ...event }))
		})),
		styles: {
			...defaultStyles,
			...styles
		},
		createdAt: now,
		updatedAt: now
	};
}
