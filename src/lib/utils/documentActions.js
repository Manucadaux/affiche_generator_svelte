/** @typedef {import('./types.js').AppDocument} AppDocument */
/** @typedef {import('./types.js').DocumentUpdates} DocumentUpdates */
/** @typedef {import('./types.js').Styles} Styles */
/** @typedef {import('./types.js').Page} Page */

import {
	addDocument,
	getDocument as getStoredDocument,
	updateDocument as saveStoredDocument,
	deleteDocument as deleteStoredDocument
} from './documentStorage.js';

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
	 * @param {string} documentId
	 * @returns {Promise<void>}
	 */
	async function deleteDocument(documentId) {
		await deleteStoredDocument(documentId);
	}

	return {
		createDocument,
		getDocument,
		updateDocument,
		deleteDocument
	};
}
