/**
 * Filtrer une collection à partir d'une recherche textuelle.
 *
 * @template T
 * @param {T[]} items
 * @param {string} query
 * @param {(item: T) => string} getSearchText
 * @param {string} [locale]
 * @returns {T[]}
 */
export function searchItems(items, query, getSearchText, locale = 'fr') {
	const normalizedQuery = query.trim().toLocaleLowerCase(locale);

	if (!normalizedQuery) return [...items];

	return items.filter((item) =>
		getSearchText(item).toLocaleLowerCase(locale).includes(normalizedQuery)
	);
}
