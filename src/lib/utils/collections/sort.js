/**
 * Trier une collection sans modifier la collection d'origine.
 *
 * @template T
 * @param {T[]} items
 * @param {(a: T, b: T) => number} compare
 * @returns {T[]}
 */
export function sortItems(items, compare) {
	return [...items].sort(compare);
}
