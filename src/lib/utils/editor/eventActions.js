/** @typedef {import('../types.js').Event} Event */
/** @typedef {import('../types.js').Page} Page */
/** @typedef {ReturnType<import('../history.js').createHistory>} History */

import { MAX_EVENTS_PER_PAGE } from '#lib/utils/constants.js';
import { defaultEventOptions } from '#lib/data/options.js';

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
	 * Vérifie si un évènement contient des informations personnalisées.
	 * @param {Object} event
	 * @param {Blob | null} image
	 * @returns {boolean}
	 */
	function isEventModified(event, image) {
		if (image) return true;

		const defaultOptions = /** @type {Record<string, unknown>} */ (defaultEventOptions);

		return Object.entries(event).some(([key, value]) => {
			if (key === 'id' || key === 'imageVersion') return false;
			return value !== defaultOptions[key];
		});
	}

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

		if (!page || page.locked || page.events.length >= MAX_EVENTS_PER_PAGE) return;

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

		if (!page || page.locked || page.events.length <= 1) return;

		const index = page.events.length - 1;
		const event = page.events[index];
		const image = await getEventImage(event.id);

		if (isEventModified(event, image)) {
			const confirmed = window.confirm(
				'Le dernier évènement contient des informations personnalisées. Voulez-vous vraiment le supprimer ?'
			);

			if (!confirmed) return;
		}

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

		if (!page || page.locked || page.reverse === checked) return;

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
