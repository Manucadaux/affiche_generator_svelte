import { getDatabase } from './database.js';

const STORE_NAME = 'eventImages';

/**
 * Enregistrer ou remplacer une image
 * @param {string} eventId
 * @param {Blob} file
 * @returns {Promise<void>}
 */
export async function saveEventImage(eventId, file) {
	const db = await getDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readwrite');

		transaction.objectStore(STORE_NAME).put(file, eventId);

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}

/**
 * Récupérer une image
 * @param {string} eventId
 * @returns {Promise<Blob | null>}
 */
export async function getEventImage(eventId) {
	const db = await getDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readonly');
		const request = transaction.objectStore(STORE_NAME).get(eventId);

		request.onsuccess = () => resolve(request.result ?? null);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Supprimer une image
 * @param {string} eventId
 * @returns {Promise<void>}
 */
export async function deleteEventImage(eventId) {
	const db = await getDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readwrite');

		transaction.objectStore(STORE_NAME).delete(eventId);

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}

/**
 * Supprimer les images de plusieurs événements
 * @param {{ id: string }[]} events
 * @returns {Promise<void>}
 */
export async function deleteEventImages(events) {
	const results = await Promise.allSettled(events.map((event) => deleteEventImage(event.id)));

	results.forEach((result) => {
		if (result.status === 'rejected') {
			console.error('Erreur lors de la suppression d’une image :', result.reason);
		}
	});
}

/**
 * Supprimer les images qui ne sont plus associées à un événement
 * @param {string[]} validEventIds
 * @returns {Promise<void>}
 */
export async function cleanupOrphanedImages(validEventIds) {
	const db = await getDatabase();
	const validIds = new Set(validEventIds);

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readwrite');
		const store = transaction.objectStore(STORE_NAME);
		const request = store.getAllKeys();

		request.onsuccess = () => {
			for (const key of request.result) {
				if (typeof key === 'string' && !validIds.has(key)) {
					store.delete(key);
				}
			}
		};

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}
