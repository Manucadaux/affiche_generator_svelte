/** @typedef {import('./types.js').Event} Event */
/** @typedef {import('./types.js').Page} Page */

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

import { defaultEventOptions } from '#lib/data/options.js';

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

	/**
	 * Ajoute une page après celle indiquée.
	 * @param {string} pageId
	 * @returns {Page | null}
	 */
	function addPage(pageId) {
		const index = pages.current.findIndex((page) => page.id === pageId);

		if (index === -1) return null;

		const newPage = createPage();
		const newPages = [...pages.current];

		newPages.splice(index + 1, 0, newPage);
		pages.current = newPages;

		return newPage;
	}

	/**
	 * Ajoute une page et défile jusqu'à celle-ci.
	 * @param {string} pageId
	 * @returns {Promise<void>}
	 */
	async function addPageAndScroll(pageId) {
		const newPage = addPage(pageId);

		if (!newPage) return;

		await scrollToPage(newPage.id);
	}

	/**
	 * Vérifie si une page comporte des modifications.
	 * @param {Page} page
	 * @returns {boolean}
	 */
	function isPageModified(page) {
		// Une page par défaut contient une seule affiche et n'est pas inversée.
		if (page.reverse !== false || page.events.length !== 1) {
			return true;
		}

		// On compare les options de chaque évènement aux valeurs par défaut.
		return page.events.some((event) =>
			Object.entries(defaultEventOptions).some(([key, value]) => Reflect.get(event, key) !== value)
		);
	}

	/**
	 * Supprime une page et ses images associées.
	 * @param {Page} page
	 * @returns {Promise<void>}
	 */
	async function removePage(page) {
		await deleteEventImages(page.events);

		if (page.events.some((event) => event.id === getSelectedEventId())) {
			clearSelectedEvent();
		}

		pages.current = pages.current.filter((item) => item.id !== page.id);
	}

	/**
	 * Supprime une page après confirmation.
	 * @param {string} pageId
	 * @returns {Promise<void>}
	 */
	async function deletePage(pageId) {
		const page = pages.current.find((page) => page.id === pageId);

		if (!page) return;

		if (pages.current.length <= 1) {
			alert('Un document doit contenir au moins une affiche.');
			return;
		}

		const confirmation = confirm(
			'Voulez-vous vraiment supprimer cette page et tous ses évènements ?'
		);

		if (!confirmation) return;

		await removePage(page);
	}

	/**
	 * Supprime la dernière page, avec confirmation uniquement si elle a été modifiée.
	 * @returns {Promise<void>}
	 */
	async function deleteLastPage() {
		if (pages.current.length <= 1) return;

		const lastPage = pages.current[pages.current.length - 1];

		if (isPageModified(lastPage)) {
			const confirmation = confirm(
				'La dernière page comporte des modifications. Voulez-vous vraiment la supprimer ?'
			);

			if (!confirmation) return;
		}

		await removePage(lastPage);
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

	return { addPage, addPageAndScroll, duplicatePage, deletePage, deleteLastPage };
}
