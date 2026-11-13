/** @typedef {import('./types.js').AppDocument} AppDocument */
/** @typedef {import('./types.js').DocumentUpdates} DocumentUpdates */
/** @typedef {import('./types.js').Styles} Styles */
/** @typedef {import('./types.js').Page} Page */

/**
 * @param {Object} dependencies
 * @param {{ current: AppDocument[] }} dependencies.documents
 * @param {() => Page} dependencies.createPage
 * @param {() => string} dependencies.generateId
 * @param {Styles} dependencies.defaultStyles
 */
export function createDocumentActions(dependencies) {
	const { documents, createPage, generateId, defaultStyles } = dependencies;

	/**
	 * @param {Object} options
	 * @param {string} options.name
	 * @param {number | null} options.libraryId
	 * @param {number | null} options.monthId
	 * @param {Styles} [options.styles]
	 * @returns {AppDocument}
	 */
	function createDocument({ name, libraryId, monthId, styles = defaultStyles }) {
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

		documents.current = [...documents.current, newDocument];

		return newDocument;
	}

	/** @param {string} documentId */
	function getDocument(documentId) {
		return documents.current.find((document) => document.id === documentId) ?? null;
	}

	/**
	 * @param {string} documentId
	 * @param {DocumentUpdates} updates
	 */
	function updateDocument(documentId, updates) {
		const exists = getDocument(documentId);

		if (!exists) return;

		const updatedDocument = {
			...exists,
			...updates,
			id: exists.id,
			version: exists.version,
			createdAt: exists.createdAt,
			updatedAt: new Date().toISOString()
		};

		documents.current = documents.current.map((document) =>
			document.id === documentId ? updatedDocument : document
		);
	}

	/** @param {string} documentId */
	function deleteDocument(documentId) {
		documents.current = documents.current.filter((document) => document.id !== documentId);
	}

	return {
		createDocument,
		getDocument,
		updateDocument,
		deleteDocument
	};
}
