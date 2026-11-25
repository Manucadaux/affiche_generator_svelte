/** @typedef {import('../types.js').AppDocument} AppDocument */

import { createStorage } from '../storage.js';
import { notifyDocumentsChanged } from './documentSync.js';

/** @type {ReturnType<typeof createStorage<AppDocument>>} */
const documentsStorage = createStorage('documents');

/**
 * Récupérer tous les documents.
 * @returns {Promise<AppDocument[]>}
 */
export async function getAllDocuments() {
	return documentsStorage.getAll();
}

/**
 * Récupérer un document par son identifiant.
 * @param {string} id
 * @returns {Promise<AppDocument | null>}
 */
export async function getDocument(id) {
	return documentsStorage.getById(id);
}

/**
 * Ajouter un nouveau document.
 * @param {AppDocument} document
 * @returns {Promise<void>}
 */
export async function addDocument(document) {
	await documentsStorage.add(document);
	notifyDocumentsChanged();
}

/**
 * Mettre à jour un document existant.
 * Ne crée jamais de document si celui-ci a été supprimé.
 * @param {AppDocument} document
 * @returns {Promise<boolean>} Indique si le document a été mis à jour.
 */
export async function updateDocument(document) {
	const wasUpdated = await documentsStorage.update(document);

	if (wasUpdated) {
		notifyDocumentsChanged();
	}

	return wasUpdated;
}

/**
 * Supprimer un document par son identifiant.
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteDocument(id) {
	await documentsStorage.remove(id);
	notifyDocumentsChanged();
}
