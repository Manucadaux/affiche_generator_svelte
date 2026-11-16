/** @typedef {import('./types.js').Event} Event */
/** @typedef {import('./types.js').Page} Page */
/** @typedef {import('./types.js').Styles} Styles */
/** @typedef {ReturnType<import('./history.js').createHistory>} History */

/**
 * @typedef {Object} Dependencies
 * @property {{ current: Page[] }} pages
 * @property {() => Page} createPage
 * @property {(eventId: string) => Promise<Blob | null>} getEventImage
 * @property {(eventId: string, image: Blob) => Promise<void>} saveEventImage
 * @property {(events: Event[]) => Promise<void>} deleteEventImages
 * @property {() => void} clearSelectedEvent
 * @property {{ current: number | null }} selectedLibrary
 * @property {{ current: number | null }} selectedMonth
 * @property {{ current: Styles }} styles
 * @property {Styles} defaultStyles
 * @property {History} history
 */

/** @param {Dependencies} dependencies */
export function createResetActions(dependencies) {
	const {
		pages,
		createPage,
		getEventImage,
		saveEventImage,
		deleteEventImages,
		clearSelectedEvent,
		selectedLibrary,
		selectedMonth,
		styles,
		defaultStyles,
		history
	} = dependencies;

	/**
	 * Récupère les images associées à une liste d'événements.
	 * @param {Event[]} events
	 * @returns {Promise<{ eventId: string, image: Blob }[]>}
	 */
	async function captureImages(events) {
		const images = await Promise.all(
			events.map(async (event) => {
				const image = await getEventImage(event.id);

				return image ? { eventId: event.id, image } : null;
			})
		);

		return images.filter((item) => item !== null);
	}

	/**
	 * Restaure une liste d'images.
	 * @param {{ eventId: string, image: Blob }[]} images
	 * @returns {Promise<void>}
	 */
	async function restoreImages(images) {
		await Promise.all(images.map(({ eventId, image }) => saveEventImage(eventId, image)));
	}

	/**
	 * Réinitialise les événements.
	 * @returns {Promise<void>}
	 */
	async function resetEvents() {
		const confirmation = confirm('Voulez-vous vraiment réinitialiser tous les évènements ?');

		if (!confirmation) return;

		const previousPages = pages.current;
		const allEvents = previousPages.flatMap((page) => page.events);
		const images = await captureImages(allEvents);
		const resetPage = createPage();

		await deleteEventImages(allEvents);

		clearSelectedEvent();
		pages.current = [resetPage];

		history.push({
			undo: async () => {
				await restoreImages(images);
				pages.current = previousPages;
			},
			redo: async () => {
				clearSelectedEvent();
				await deleteEventImages(allEvents);
				pages.current = [resetPage];
			}
		});
	}

	/**
	 * Réinitialise toutes les données de l'affiche.
	 * @returns {Promise<void>}
	 */
	async function resetAll() {
		const confirmation = confirm(
			'Voulez-vous vraiment tout réinitialiser ? Cette action supprimera toutes les affiches et remettra les paramètres par défaut.'
		);

		if (!confirmation) return;

		const previousPages = pages.current;
		const previousLibrary = selectedLibrary.current;
		const previousMonth = selectedMonth.current;
		const previousStyles = { ...styles.current };
		const resetStyles = {
			...defaultStyles,
			zoom: previousStyles.zoom,
			autoZoom: previousStyles.autoZoom
		};

		const allEvents = previousPages.flatMap((page) => page.events);
		const images = await captureImages(allEvents);
		const resetPage = createPage();

		await deleteEventImages(allEvents);

		clearSelectedEvent();
		pages.current = [resetPage];
		selectedLibrary.current = null;
		selectedMonth.current = null;
		styles.current = resetStyles;

		history.push({
			undo: async () => {
				await restoreImages(images);
				pages.current = previousPages;
				selectedLibrary.current = previousLibrary;
				selectedMonth.current = previousMonth;
				styles.current = previousStyles;
			},
			redo: async () => {
				clearSelectedEvent();
				await deleteEventImages(allEvents);
				pages.current = [resetPage];
				selectedLibrary.current = null;
				selectedMonth.current = null;
				styles.current = { ...defaultStyles };
			}
		});
	}

	return { resetEvents, resetAll };
}
