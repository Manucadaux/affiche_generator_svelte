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
 * @property {() => string} generateId
 * @property {(eventId: string) => Promise<Blob | null>} getEventImage
 * @property {(eventId: string, image: Blob) => Promise<void>} saveEventImage
 * @property {(events: Event[]) => Promise<void>} deleteEventImages
 * @property {() => string | null} getSelectedEventId
 * @property {() => void} clearSelectedEvent
 * @property {(pageId: string) => Promise<void>} scrollToPage
 */

/** @param {Dependencies} dependencies */
export function createPageActions(dependencies) {
	const {
		pages,
		createPage,
		generateId,
		getEventImage,
		saveEventImage,
		deleteEventImages,
		scrollToPage,
		getSelectedEventId,
		clearSelectedEvent
	} = dependencies;

	/** @param {string} pageId */
	async function addPage(pageId) {
		const index = pages.current.findIndex((page) => page.id === pageId);

		if (index === -1) return;

		const newPage = createPage();
		const newPages = [...pages.current];

		newPages.splice(index + 1, 0, newPage);
		pages.current = newPages;

		await scrollToPage(newPage.id);
	}

	/** @param {string} pageId */
	async function deletePage(pageId) {
		const confirmation = confirm(
			'Voulez-vous vraiment supprimer cette page et tous ses évènements ?'
		);

		if (!confirmation) return;

		const page = pages.current.find((page) => page.id === pageId);

		if (!page) return;

		await deleteEventImages(page.events);

		if (page.events.some((event) => event.id === getSelectedEventId())) {
			clearSelectedEvent();
		}

		pages.current = pages.current.filter((page) => page.id !== pageId);
	}

	/** @param {string} pageId */
	async function duplicatePage(pageId) {
		const sourcePage = pages.current.find((page) => page.id === pageId);

		if (!sourcePage) return;

		const duplicatedPage = {
			...sourcePage,
			id: generateId(),
			events: sourcePage.events.map((event) => ({
				...event,
				id: generateId()
			}))
		};

		try {
			await Promise.all(
				sourcePage.events.map(async (event, index) => {
					const image = await getEventImage(event.id);

					if (image) {
						await saveEventImage(duplicatedPage.events[index].id, image);
					}
				})
			);

			const index = pages.current.findIndex((page) => page.id === pageId);

			if (index === -1) {
				await deleteEventImages(duplicatedPage.events);
				return;
			}

			const newPages = [...pages.current];
			newPages.splice(index + 1, 0, duplicatedPage);

			pages.current = newPages;
			await scrollToPage(duplicatedPage.id);
		} catch (error) {
			await deleteEventImages(duplicatedPage.events);

			console.error('Erreur lors de la duplication de la page :', error);
			alert('Impossible de dupliquer la page.');
		}
	}

	return { addPage, duplicatePage, deletePage };
}
