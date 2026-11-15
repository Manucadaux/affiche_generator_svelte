/** @typedef {import('./types.js').AppDocument} AppDocument */

import { getAllDocuments, addDocument } from './documentStorage.js';

const MIGRATION_KEY = 'documentsStorageMigrationVersion';

/**
 * Migre les documents du localStorage vers IndexedDB.
 * @returns {Promise<void>}
 */
export async function migrateDocumentsToIndexedDB() {
	if (localStorage.getItem(MIGRATION_KEY) === '1') return;

	const rawDocuments = localStorage.getItem('documents');

	if (rawDocuments === null) {
		localStorage.setItem(MIGRATION_KEY, '1');
		return;
	}

	const parsedDocuments = JSON.parse(rawDocuments);

	if (
		!Array.isArray(parsedDocuments) ||
		!parsedDocuments.every(
			(document) =>
				document !== null && typeof document === 'object' && typeof document.id === 'string'
		)
	) {
		throw new Error('Les anciennes données des documents sont invalides.');
	}

	/** @type {AppDocument[]} */
	const legacyDocuments = parsedDocuments;

	const existingDocuments = await getAllDocuments();
	const existingIds = new Set(existingDocuments.map((document) => document.id));

	let migratedCount = 0;

	for (const document of legacyDocuments) {
		if (existingIds.has(document.id)) continue;

		await addDocument(document);
		existingIds.add(document.id);
		migratedCount++;
	}

	localStorage.setItem(MIGRATION_KEY, '1');

	console.info(`${migratedCount} document(s) migré(s) vers IndexedDB.`);
}
