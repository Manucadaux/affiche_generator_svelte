/** @typedef {import('./types.js').AppDocument} AppDocument */
/** @typedef {import('./types.js').DocumentUpdates} DocumentUpdates */
/** @typedef {import('./types.js').Styles} Styles */
/** @typedef {import('./types.js').Page} Page */
/**
 * @typedef {Object} DeletedDocument
 * @property {AppDocument} document
 * @property {{ eventId: string, image: Blob }[]} images
 */

import {
	addDocument,
	getDocument as getStoredDocument,
	getAllDocuments,
	updateDocument as saveStoredDocument,
	deleteDocument as deleteStoredDocument
} from './documentStorage.js';

import { deleteEventImages, getEventImage, saveEventImage } from './imageStorage.js';

/**
 * @param {Object} dependencies
 * @param {() => Page} dependencies.createPage
 * @param {() => string} dependencies.generateId
 * @param {Styles} dependencies.defaultStyles
 */
export function createDocumentActions(dependencies) {
	const { createPage, generateId, defaultStyles } = dependencies;

	/**
	 * @param {Object} options
	 * @param {string} options.name
	 * @param {number | null} options.libraryId
	 * @param {number | null} options.monthId
	 * @param {Styles} [options.styles]
	 * @returns {Promise<AppDocument>}
	 */
	async function createDocument({ name, libraryId, monthId, styles = defaultStyles }) {
		const now = new Date().toISOString();

		const newDocument = {
			id: generateId(),
			version: 1,
			name,
			libraryId,
			monthId,
			pages: [createPage()],
			styles: { ...styles },
			createdAt: now,
			updatedAt: now
		};

		await addDocument(newDocument);

		return newDocument;
	}

	/**
	 * @param {string} documentId
	 * @returns {Promise<AppDocument | null>}
	 */
	async function getDocument(documentId) {
		return getStoredDocument(documentId);
	}

	/**
	 * @param {string} documentId
	 * @param {DocumentUpdates} updates
	 * @returns {Promise<void>}
	 */
	async function updateDocument(documentId, updates) {
		const existingDocument = await getDocument(documentId);

		if (!existingDocument) return;

		const updatedDocument = {
			...existingDocument,
			...updates,
			id: existingDocument.id,
			version: existingDocument.version,
			createdAt: existingDocument.createdAt,
			updatedAt: new Date().toISOString()
		};

		await saveStoredDocument(updatedDocument);
	}

	/**
	 * Duplique un document avec de nouveaux identifiants et des images indépendantes.
	 * @param {string} documentId
	 * @returns {Promise<AppDocument | null>}
	 */
	async function duplicateDocument(documentId) {
		const existingDocument = await getDocument(documentId);

		if (!existingDocument) return null;

		const documents = await getAllDocuments();
		const existingNames = new Set(documents.map((document) => document.name));

		let name = `${existingDocument.name} (copie)`;
		let suffix = 1;

		while (existingNames.has(name)) {
			name = `${existingDocument.name} (copie ${suffix})`;
			suffix++;
		}

		const now = new Date().toISOString();

		// Crée de nouveaux identifiants pour chaque page et événement.
		const newPages = existingDocument.pages.map((page) => ({
			...page,
			id: generateId(),
			events: page.events.map((event) => ({
				...event,
				id: generateId()
			}))
		}));

		const duplicatedDocument = {
			...existingDocument,
			id: generateId(),
			name,
			pages: newPages,
			styles: { ...existingDocument.styles },
			createdAt: now,
			updatedAt: now
		};

		const imageCopies = existingDocument.pages.flatMap((page, pageIndex) =>
			page.events.map((event, eventIndex) => ({
				sourceId: event.id,
				targetId: newPages[pageIndex].events[eventIndex].id
			}))
		);

		try {
			const results = await Promise.allSettled(
				imageCopies.map(async ({ sourceId, targetId }) => {
					const image = await getEventImage(sourceId);

					if (image) {
						await saveEventImage(targetId, image);
					}
				})
			);

			const failedCopy = results.find((result) => result.status === 'rejected');

			if (failedCopy) {
				throw failedCopy.reason;
			}

			await addDocument(duplicatedDocument);

			return duplicatedDocument;
		} catch (error) {
			// Nettoie les éventuelles images déjà copiées en cas d'échec.
			const newEvents = newPages.flatMap((page) => page.events);
			await deleteEventImages(newEvents);
			throw error;
		}
	}

	/**
	 * Supprime un document en conservant temporairement ses données et ses images.
	 * @param {string} documentId
	 * @returns {Promise<DeletedDocument | null>}
	 */
	async function deleteDocument(documentId) {
		const existingDocument = await getDocument(documentId);

		if (!existingDocument) return null;

		const events = existingDocument.pages.flatMap((page) => page.events);

		const images = (
			await Promise.all(
				events.map(async (event) => ({
					eventId: event.id,
					image: await getEventImage(event.id)
				}))
			)
		).filter(
			/**
			 * @param {{ eventId: string, image: Blob | null }} item
			 * @returns {item is { eventId: string, image: Blob }}
			 */
			(item) => item.image !== null
		);

		await deleteStoredDocument(documentId);
		await deleteEventImages(events);

		return {
			document: existingDocument,
			images
		};
	}

	/**
	 * Restaure un document supprimé et ses images.
	 * @param {DeletedDocument} deletedDocument
	 * @returns {Promise<void>}
	 */
	async function restoreDocument(deletedDocument) {
		const { document, images } = deletedDocument;
		const events = document.pages.flatMap((page) => page.events);

		try {
			await Promise.all(images.map(({ eventId, image }) => saveEventImage(eventId, image)));

			await addDocument(document);
		} catch (error) {
			await deleteEventImages(events);
			throw error;
		}
	}

	return {
		createDocument,
		getDocument,
		updateDocument,
		deleteDocument,
		restoreDocument,
		duplicateDocument
	};
}
