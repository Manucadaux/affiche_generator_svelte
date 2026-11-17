/** @typedef {import('../types.js').ManagedEvent} ManagedEvent */

import { createStorage } from '../storage.js';

/** @type {ReturnType<typeof createStorage<ManagedEvent>>} */
const eventsStorage = createStorage('events');

/**
 * Récupérer tous les événements.
 * @returns {Promise<ManagedEvent[]>}
 */
export async function getAllEvents() {
	return eventsStorage.getAll();
}

/**
 * Récupérer un événement par son identifiant.
 * @param {string} id
 * @returns {Promise<ManagedEvent | null>}
 */
export async function getEvent(id) {
	return eventsStorage.getById(id);
}

/**
 * Ajouter un nouvel événement.
 * @param {ManagedEvent} event
 * @returns {Promise<void>}
 */
export async function addEvent(event) {
	await eventsStorage.add(event);
}

/**
 * Mettre à jour un événement existant.
 * Ne crée jamais d'événement s'il a été supprimé.
 * @param {ManagedEvent} event
 * @returns {Promise<boolean>} Indique si l'événement a été mis à jour.
 */
export async function updateEvent(event) {
	return eventsStorage.update(event);
}

/**
 * Supprimer un événement par son identifiant.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteEvent(id) {
	await eventsStorage.remove(id);
}
