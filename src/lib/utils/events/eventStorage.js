/** @typedef {import('../types.js').ManagedEvent} ManagedEvent */

import { notifyEventsChanged } from './eventSync.js';
import { createStorage } from '../storage.js';
import { normalizeManagedEvent } from './eventFactory.js';

/** @type {ReturnType<typeof createStorage<ManagedEvent>>} */
const eventsStorage = createStorage('events');

/**
 * Récupérer tous les événements.
 * @returns {Promise<ManagedEvent[]>}
 */
export async function getAllEvents() {
	const events = await eventsStorage.getAll();

	return events.map(normalizeManagedEvent);
}

/**
 * Récupérer un événement par son identifiant.
 * @param {string} id
 * @returns {Promise<ManagedEvent | null>}
 */
export async function getEvent(id) {
	const event = await eventsStorage.getById(id);

	return event ? normalizeManagedEvent(event) : null;
}

/**
 * Ajouter un nouvel événement.
 * @param {ManagedEvent} event
 * @returns {Promise<void>}
 */
export async function addEvent(event) {
	await eventsStorage.add(event);
	notifyEventsChanged();
}

/**
 * Mettre à jour un événement existant.
 * Ne crée jamais d'événement s'il a été supprimé.
 * @param {ManagedEvent} event
 * @returns {Promise<boolean>} Indique si l'événement a été mis à jour.
 */
export async function updateEvent(event) {
	const wasUpdated = await eventsStorage.update(event);

	if (wasUpdated) {
		notifyEventsChanged();
	}

	return wasUpdated;
}

/**
 * Supprimer un événement par son identifiant.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteEvent(id) {
	await eventsStorage.remove(id);
	notifyEventsChanged();
}
