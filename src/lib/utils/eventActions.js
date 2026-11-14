/** @typedef {import('./types.js').Event} Event */
/** @typedef {import('./types.js').Page} Page */

import { MAX_EVENTS_PER_PAGE } from '#lib/utils/constants.js';

/**
 * @typedef {Object} Dependencies
 * @property {{ current: Page[] }} pages
 * @property {() => Event} createEvent
 * @property {(events: Event[]) => Promise<void>} deleteEventImages
 * @property {() => string | null} getSelectedEventId
 * @property {() => void} clearSelectedEvent
 */

/** @param {Dependencies} dependencies */
export function createEventActions(dependencies) {
	const { pages, createEvent, deleteEventImages, getSelectedEventId, clearSelectedEvent } =
		dependencies;

	/** @param {string} pageId */
	function addEvent(pageId) {
		pages.current = pages.current.map((page) =>
			page.id === pageId && page.events.length < MAX_EVENTS_PER_PAGE
				? {
						...page,
						events: [...page.events, createEvent()]
					}
				: page
		);
	}

	/**
	 * @param {string} pageId
	 */
	async function removeEvent(pageId) {
		const page = pages.current.find((page) => page.id === pageId);

		if (!page || page.events.length <= 1) return;

		const eventToRemove = page.events[page.events.length - 1];

		await deleteEventImages([eventToRemove]);

		if (eventToRemove.id === getSelectedEventId()) {
			clearSelectedEvent();
		}

		pages.current = pages.current.map((page) =>
			page.id === pageId ? { ...page, events: page.events.slice(0, -1) } : page
		);
	}

	/**
	 * @param {string} pageId
	 * @param {boolean} checked
	 */
	function toggleReverse(pageId, checked) {
		pages.current = pages.current.map((page) =>
			page.id === pageId ? { ...page, reverse: checked } : page
		);
	}

	/**
	 * @template {keyof Event} K
	 * @param {string} eventId
	 * @param {K} field
	 * @param {Event[K]} value
	 */
	function updateEvent(eventId, field, value) {
		pages.current = pages.current.map((page) => {
			// Ne pas toucher aux pages qui ne contiennent pas cet évènement
			if (!page.events.some((event) => event.id === eventId)) {
				return page;
			}

			return {
				...page,
				events: page.events.map((event) =>
					event.id === eventId ? { ...event, [field]: value } : event
				)
			};
		});
	}

	return { addEvent, removeEvent, toggleReverse, updateEvent };
}
