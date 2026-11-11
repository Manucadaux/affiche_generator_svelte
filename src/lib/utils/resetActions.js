/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {number} imageVersion
 * @property {string} title
 * @property {number} sizeTitle
 * @property {string} date
 * @property {string} hour
 * @property {string} content
 * @property {number} sizeDescription
 * @property {string} condition
 * @property {boolean} inscription
 */

/**
 * @typedef {Object} Page
 * @property {string} id
 * @property {boolean} reverse
 * @property {Event[]} events
 */

/**
 * @typedef {Object} Dependencies
 * @property {{ current: Page[] }} pages
 * @property {() => Page} createPage
 * @property {(events: Event[]) => Promise<void>} deleteEventImages
 * @property {() => void} clearSelectedEvent
 * @property {{ current: number | null }} selectedLibrary
 * @property {{ current: number | null }} selectedMonth
 * @property {{ current: Object }} styles
 * @property {Object} defaultStyles
 */

/** @param {Dependencies} dependencies */
export function createResetActions(dependencies) {
	const {
		pages,
		createPage,
		deleteEventImages,
		clearSelectedEvent,
		selectedLibrary,
		selectedMonth,
		styles,
		defaultStyles
	} = dependencies;

	async function resetEvents() {
		const confirmation = confirm('Voulez-vous vraiment réinitialiser tous les évènements ?');

		if (!confirmation) return;

		const allEvents = pages.current.flatMap((page) => page.events);

		await deleteEventImages(allEvents);

		clearSelectedEvent();
		pages.current = [createPage()];
	}

	async function resetAll() {
		const confirmation = confirm(
			'Voulez-vous vraiment tout réinitialiser ? Cette action supprimera toutes les affiches et remettra les paramètres par défaut.'
		);

		if (!confirmation) return;

		const allEvents = pages.current.flatMap((page) => page.events);

		await deleteEventImages(allEvents);

		clearSelectedEvent();
		pages.current = [createPage()];
		selectedLibrary.current = null;
		selectedMonth.current = null;
		styles.current = { ...defaultStyles };
	}

	return { resetEvents, resetAll };
}
