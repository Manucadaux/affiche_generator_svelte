/** @typedef {import('../types.js').AppDocument} AppDocument */

import { SvelteDate } from 'svelte/reactivity';

import {
	getDocument as getStoredDocument,
	updateDocument as saveStoredDocument
} from '../documents/documentStorage.js';

import { createSaveQueue, createSnapshotTracker } from '../persistence.js';

/**
 * Crée les mécanismes de persistance propres à l'éditeur de documents.
 */
export function createDocumentPersistence() {
	const snapshotTracker = createSnapshotTracker();

	/**
	 * Crée un snapshot du document sans les proxys réactifs de Svelte.
	 *
	 * @param {AppDocument} document
	 * @returns {string}
	 */
	function createDocumentSnapshot(document) {
		return JSON.stringify($state.snapshot(document));
	}

	/**
	 * Charge un document et applique les éventuelles migrations.
	 *
	 * Le snapshot initial est conservé avant migration afin que celle-ci
	 * soit détectée comme une modification à sauvegarder.
	 *
	 * @param {string} documentId
	 * @returns {Promise<AppDocument | null>}
	 */
	async function loadDocument(documentId) {
		let document = await getStoredDocument(documentId);

		if (!document) return null;

		const originalSnapshot = JSON.stringify(document);

		// Suppression de l'ancienne préférence autoZoom.
		if (Object.hasOwn(document.styles, 'autoZoom')) {
			const styles = /** @type {typeof document.styles & { autoZoom?: boolean }} */ ({
				...document.styles
			});

			delete styles.autoZoom;

			document = {
				...document,
				styles
			};

			document = {
				...document,
				styles
			};
		}

		// Ajout de la propriété locked aux anciennes pages.
		if (document.pages.some((page) => typeof page.locked !== 'boolean')) {
			document = {
				...document,
				pages: document.pages.map((page) => ({
					...page,
					locked: page.locked ?? false
				}))
			};
		}

		snapshotTracker.reset(originalSnapshot);

		return document;
	}

	/**
	 * Enregistre un document et actualise le snapshot après succès.
	 *
	 * @param {{ document: AppDocument, snapshot: string }} data
	 * @returns {Promise<void>}
	 */
	async function persistDocument({ document, snapshot }) {
		const updated = await saveStoredDocument(document);

		if (!updated) {
			throw new Error('Le document n’existe plus.');
		}

		snapshotTracker.markSaved(snapshot);
	}

	const saveQueue = createSaveQueue(persistDocument);

	/**
	 * Indique si le document diffère du dernier snapshot enregistré.
	 *
	 * @param {AppDocument} document
	 * @returns {boolean}
	 */
	function hasChanged(document) {
		return snapshotTracker.hasChanged(createDocumentSnapshot(document));
	}

	/**
	 * Ajoute une sauvegarde à la file d'attente.
	 *
	 * @param {AppDocument} document
	 * @returns {Promise<void>}
	 */
	function enqueueDocumentSave(document) {
		const plainDocument = $state.snapshot(document);
		const snapshot = JSON.stringify(plainDocument);

		const updatedDocument = {
			...plainDocument,
			updatedAt: new SvelteDate().toISOString()
		};

		return saveQueue.enqueue({
			document: updatedDocument,
			snapshot
		});
	}

	/**
	 * Attend les sauvegardes en cours et enregistre le document
	 * si son contenu diffère du dernier snapshot sauvegardé.
	 *
	 * @param {AppDocument} document
	 * @returns {Promise<void>}
	 */
	async function saveCurrentDocument(document) {
		await saveQueue.wait();

		if (hasChanged(document)) {
			await enqueueDocumentSave(document);
		}
	}

	return {
		loadDocument,
		hasChanged,
		enqueueDocumentSave,
		saveCurrentDocument
	};
}
