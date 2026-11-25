/** @typedef {import('../types.js').Event} Event */
/** @typedef {import('../types.js').Page} Page */
/** @typedef {ReturnType<import('../history.js').createHistory>} History */

/**
 * @typedef {Object} Dependencies
 * @property {{ current: Page[] }} pages
 * @property {() => Page} createPage
 * @property {() => string} generateId
 * @property {(eventId: string) => Promise<Blob | null>} getEventImage
 * @property {(eventId: string, image: Blob) => Promise<void>} saveEventImage
 * @property {(events: Event[]) => Promise<void>} deleteEventImages
 * @property {History} history
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
		history,
		scrollToPage,
		getSelectedEventId,
		clearSelectedEvent
	} = dependencies;

	/**
	 * Insère une page à une position donnée.
	 * @param {number} index
	 * @param {Page} page
	 */
	function insertPage(index, page) {
		const newPages = [...pages.current];
		newPages.splice(index, 0, page);
		pages.current = newPages;
	}

	/**
	 * Retire une page du document.
	 * @param {string} pageId
	 */
	function removePageFromDocument(pageId) {
		pages.current = pages.current.filter((item) => item.id !== pageId);
	}

	/**
	 * Restaure les images d'une page.
	 * @param {{ eventId: string, image: Blob }[]} images
	 * @returns {Promise<void>}
	 */
	async function restorePageImages(images) {
		await Promise.all(images.map(({ eventId, image }) => saveEventImage(eventId, image)));
	}

	/**
	 * Ajoute une page après celle indiquée.
	 * @param {string} pageId
	 * @returns {Page | null}
	 */
	function addPage(pageId) {
		const index = pages.current.findIndex((page) => page.id === pageId);

		if (index === -1) return null;

		const newPage = createPage();
		const newIndex = index + 1;

		insertPage(newIndex, newPage);

		history.push({
			undo: () => removePageFromDocument(newPage.id),
			redo: () => insertPage(newIndex, newPage)
		});

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
	 * Supprime une page et enregistre sa restauration dans l'historique.
	 * @param {Page} page
	 * @returns {Promise<void>}
	 */
	async function removePage(page) {
		const index = pages.current.findIndex((item) => item.id === page.id);

		if (index === -1) return;

		// On conserve les images avant leur suppression.
		const images = (
			await Promise.all(
				page.events.map(async (event) => {
					const image = await getEventImage(event.id);

					return image ? { eventId: event.id, image } : null;
				})
			)
		).filter((item) => item !== null);

		await deleteEventImages(page.events);

		if (page.events.some((event) => event.id === getSelectedEventId())) {
			clearSelectedEvent();
		}

		removePageFromDocument(page.id);

		history.push({
			undo: async () => {
				await restorePageImages(images);
				insertPage(index, page);
			},
			redo: async () => {
				if (page.events.some((event) => event.id === getSelectedEventId())) {
					clearSelectedEvent();
				}

				await deleteEventImages(page.events);
				removePageFromDocument(page.id);
			}
		});
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

	/**
	 * Duplique une page et ses images.
	 * @param {string} pageId
	 * @returns {Promise<void>}
	 */
	async function duplicatePage(pageId) {
		const sourcePage = pages.current.find((page) => page.id === pageId);

		if (!sourcePage) return;

		const duplicatedPage = {
			...sourcePage,
			id: generateId(),
			locked: false,
			events: sourcePage.events.map((event) => ({
				...event,
				id: generateId()
			}))
		};

		/** @type {{ eventId: string, image: Blob }[]} */
		let images = [];

		try {
			images = (
				await Promise.all(
					sourcePage.events.map(async (event, index) => {
						const image = await getEventImage(event.id);

						return image ? { eventId: duplicatedPage.events[index].id, image } : null;
					})
				)
			).filter((item) => item !== null);

			await restorePageImages(images);
		} catch (error) {
			await deleteEventImages(duplicatedPage.events);

			console.error('Erreur lors de la duplication de la page :', error);
			alert('Impossible de dupliquer la page.');
			return;
		}

		const index = pages.current.findIndex((page) => page.id === pageId);

		if (index === -1) {
			await deleteEventImages(duplicatedPage.events);
			return;
		}

		const duplicatedIndex = index + 1;

		insertPage(duplicatedIndex, duplicatedPage);

		history.push({
			undo: async () => {
				await deleteEventImages(duplicatedPage.events);
				removePageFromDocument(duplicatedPage.id);
			},
			redo: async () => {
				await restorePageImages(images);
				insertPage(duplicatedIndex, duplicatedPage);
			}
		});

		await scrollToPage(duplicatedPage.id);
	}

	/**
	 * Verrouille ou déverrouille une page.
	 * @param {string} pageId
	 */
	function toggleLock(pageId) {
		pages.current = pages.current.map((page) =>
			page.id === pageId ? { ...page, locked: !page.locked } : page
		);
	}

	return { addPage, addPageAndScroll, duplicatePage, deletePage, deleteLastPage, toggleLock };
}
