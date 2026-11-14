/** @typedef {import('./types.js').AppDocument} AppDocument */

import { getDatabase } from './database.js';

const STORE_NAME = 'documents';

/**
 * Récupérer tous les documents.
 * @returns {Promise<AppDocument[]>}
 */
export async function getAllDocuments() {
	const db = await getDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readonly');
		const request = transaction.objectStore(STORE_NAME).getAll();

		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Récupérer un document par son identifiant.
 * @param {string} id
 * @returns {Promise<AppDocument | null>}
 */
export async function getDocument(id) {
	const db = await getDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readonly');
		const request = transaction.objectStore(STORE_NAME).get(id);

		request.onsuccess = () => resolve(request.result ?? null);
		request.onerror = () => reject(request.error);
	});
}

/**
 * Ajouter un nouveau document.
 * @param {AppDocument} document
 * @returns {Promise<void>}
 */
export async function addDocument(document) {
	const db = await getDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readwrite');

		transaction.objectStore(STORE_NAME).add(document);

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}

/**
 * Mettre à jour un document existant.
 * @param {AppDocument} document
 * @returns {Promise<void>}
 */
export async function updateDocument(document) {
	const db = await getDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readwrite');

		transaction.objectStore(STORE_NAME).put(document);

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}

/**
 * Supprimer un document par son identifiant.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteDocument(id) {
	const db = await getDatabase();

	return new Promise((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readwrite');

		transaction.objectStore(STORE_NAME).delete(id);

		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error);
		transaction.onabort = () => reject(transaction.error);
	});
}
