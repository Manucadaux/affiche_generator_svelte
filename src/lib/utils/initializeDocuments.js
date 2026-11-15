import { migrateLegacyDocument } from './documentMigration.js';
import { migrateDocumentsToIndexedDB } from './documentStorageMigration.js';

import { generateId } from './factories.js';
import { defaultStyles, defaultEventOptions } from '#lib/data/options.js';

/**
 * Initialise le stockage des documents.
 * Exécute les migrations dans le bon ordre.
 * @returns {Promise<void>}
 */
export async function initializeDocuments() {
	/** @type {import('./types.js').AppDocument[]} */
	const existingDocuments = JSON.parse(localStorage.getItem('documents') ?? '[]');

	const legacyDocuments = {
		current: existingDocuments
	};

	migrateLegacyDocument({
		documents: legacyDocuments,
		generateId,
		defaultStyles,
		defaultEvent: defaultEventOptions
	});

	await migrateDocumentsToIndexedDB();
}
