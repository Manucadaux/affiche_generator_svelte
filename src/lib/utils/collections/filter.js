/**
 * Filter a collection using multiple independent predicates.
 * All predicates must return true for an item to be kept.
 *
 * @template T
 * @param {T[]} items
 * @param {Array<(item: T) => boolean>} predicates
 * @returns {T[]}
 */
export function filterItems(items, predicates) {
	if (predicates.length === 0) return [...items];

	return items.filter((item) => predicates.every((predicate) => predicate(item)));
}
