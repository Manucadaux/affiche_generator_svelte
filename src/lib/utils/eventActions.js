/** @typedef {import('./types.js').Event} Event */
/** @typedef {import('./types.js').Page} Page */
/** @typedef {ReturnType<import('./history.js').createHistory>} History */

import { MAX_EVENTS_PER_PAGE } from '#lib/utils/constants.js';

/**
 * @typedef {Object} Dependencies
 * @property {{ current: Page[] }} pages
 * @property {() => Event} createEvent
 * @property {(events: Event[]) => Promise<void>} deleteEventImages
 * @property {(eventId: string) => Promise<Blob | null>} getEventImage
 * @property {(eventId: string, image: Blob) => Promise<void>} saveEventImage
 * @property {History} history
 * @property {() => string | null} getSelectedEventId
 * @property {() => void} clearSelectedEvent
 */

/** @param {Dependencies} dependencies */
export function createEventActions(dependencies) {
	const {
		pages,
		createEvent,
		deleteEventImages,
		getEventImage,
		saveEventImage,
		history,
		getSelectedEventId,
		clearSelectedEvent
	} = dependencies;

	/**
	 * Insère un événement à une position donnée.
	 * @param {string} pageId
	 * @param {number} index
	 * @param {Event} event
	 */
	function insertEvent(pageId, index, event) {
		pages.current = pages.current.map((page) => {
			if (page.id !== pageId) return page;

			const events = [...page.events];
			events.splice(index, 0, event);

			return { ...page, events };
		});
	}

	/**
	 * Retire un événement d'une page.
	 * @param {string} pageId
	 * @param {string} eventId
	 */
	function removeEventFromPage(pageId, eventId) {
		pages.current = pages.current.map((page) =>
			page.id === pageId
				? { ...page, events: page.events.filter((event) => event.id !== eventId) }
				: page
		);
	}

	/** @param {string} pageId */
	function addEvent(pageId) {
		const page = pages.current.find((page) => page.id === pageId);

		if (!page || page.events.length >= MAX_EVENTS_PER_PAGE) return;

		const event = createEvent();
		const index = page.events.length;

		insertEvent(pageId, index, event);

		history.push({
			undo: async () => {
				await deleteEventImages([event]);

				if (getSelectedEventId() === event.id) {
					clearSelectedEvent();
				}

				removeEventFromPage(pageId, event.id);
			},
			redo: () => insertEvent(pageId, index, event)
		});
	}

	/** @param {string} pageId */
	async function removeEvent(pageId) {
		const page = pages.current.find((page) => page.id === pageId);

		if (!page || page.events.length <= 1) return;

		const index = page.events.length - 1;
		const event = page.events[index];
		const image = await getEventImage(event.id);

		await deleteEventImages([event]);

		if (event.id === getSelectedEventId()) {
			clearSelectedEvent();
		}

		removeEventFromPage(pageId, event.id);

		history.push({
			undo: async () => {
				if (image) {
					await saveEventImage(event.id, image);
				}

				insertEvent(pageId, index, event);
			},
			redo: async () => {
				if (event.id === getSelectedEventId()) {
					clearSelectedEvent();
				}

				await deleteEventImages([event]);
				removeEventFromPage(pageId, event.id);
			}
		});
	}

	/**
	 * Inverse une page et enregistre le changement dans l'historique.
	 * @param {string} pageId
	 * @param {boolean} checked
	 */
	function toggleReverse(pageId, checked) {
		const page = pages.current.find((page) => page.id === pageId);

		if (!page || page.reverse === checked) return;

		/**
		 * Applique l'inversion à une page.
		 * @param {boolean} value
		 */
		function applyReverse(value) {
			pages.current = pages.current.map((page) =>
				page.id === pageId ? { ...page, reverse: value } : page
			);
		}

		const previousValue = page.reverse;

		applyReverse(checked);

		history.push({
			undo: () => applyReverse(previousValue),
			redo: () => applyReverse(checked)
		});
	}

	/**
	 * @template {keyof Event} K
	 * @param {string} eventId
	 * @param {K} field
	 * @param {Event[K]} value
	 */
	function updateEvent(eventId, field, value) {
		const pageIndex = pages.current.findIndex((page) =>
			page.events.some((event) => event.id === eventId)
		);

		if (pageIndex === -1) return;

		const page = pages.current[pageIndex];

		pages.current = [...pages.current];
		pages.current[pageIndex] = {
			...page,
			events: page.events.map((event) =>
				event.id === eventId ? { ...event, [field]: value } : event
			)
		};
	}

	return { addEvent, removeEvent, toggleReverse, updateEvent };
}
