/** @typedef {import('./types.js').AppDocument} AppDocument */
/** @typedef {import('./types.js').Page} Page */
/** @typedef {import('./types.js').Styles} Styles */

/**
 * @typedef {Object} LegacyDocumentData
 * @property {string} [name]
 * @property {number | null} [libraryId]
 * @property {number | null} [monthId]
 * @property {Page[]} pages
 * @property {Partial<Styles>} [styles]
 */

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @returns {value is Page[]}
 */
function isValidPages(value) {
	return (
		Array.isArray(value) &&
		value.every(
			/**
			 * @param {unknown} page
			 */
			(page) =>
				isRecord(page) &&
				typeof page.id === 'string' &&
				Array.isArray(page.events) &&
				page.events.every(
					/**
					 * @param {unknown} event
					 */
					(event) => isRecord(event) && typeof event.id === 'string'
				)
		)
	);
}

/**
 * @param {string} key
 */
function readLegacyValue(key) {
	const raw = localStorage.getItem(key);

	return {
		exists: raw !== null,
		value: raw === null ? undefined : JSON.parse(raw)
	};
}

/**
 * Construit un document à partir des anciennes données du Generator.
 *
 * @param {Object} options
 * @param {LegacyDocumentData} options.legacyData
 * @param {() => string} options.generateId
 * @param {Styles} options.defaultStyles
 * @param {string} options.now
 * @returns {AppDocument}
 */
export function createLegacyDocument({ legacyData, generateId, defaultStyles, now }) {
	const { name, libraryId, monthId, pages, styles } = legacyData;

	return {
		id: generateId(),
		version: 1,
		name: name?.trim() || 'Mon document',
		libraryId: libraryId ?? null,
		monthId: monthId ?? null,
		pages: pages.map((page) => ({
			...page,
			events: page.events.map((event) => ({ ...event }))
		})),
		styles: {
			...defaultStyles,
			...styles
		},
		createdAt: now,
		updatedAt: now
	};
}

/**
 * Migre les anciennes données du Generator vers le nouveau système de documents.
 *
 * @param {Object} options
 * @param {{ current: AppDocument[] }} options.documents
 * @param {() => string} options.generateId
 * @param {Styles} options.defaultStyles
 * @returns {void}
 */
export function migrateLegacyDocument({ documents, generateId, defaultStyles }) {
	const migrationKey = 'documentsMigrationVersion';

	// Migration déjà effectuée
	if (localStorage.getItem(migrationKey) === '1') return;

	// Des documents existent déjà : ne rien migrer
	if (documents.current.length > 0) {
		localStorage.setItem(migrationKey, '1');
		return;
	}

	try {
		const legacyName = readLegacyValue('documentName');
		const legacyLibrary = readLegacyValue('selectedLibraryId');
		const legacyMonth = readLegacyValue('selectedMonthId');
		const legacyPages = readLegacyValue('pages');
		const legacyStyles = readLegacyValue('styles');

		const legacyValues = [legacyName, legacyLibrary, legacyMonth, legacyPages, legacyStyles];

		// Aucune ancienne donnée : il n'y a rien à migrer
		if (!legacyValues.some((item) => item.exists)) {
			localStorage.setItem(migrationKey, '1');
			return;
		}

		if (!legacyPages.exists || !isValidPages(legacyPages.value)) {
			throw new Error('Les anciennes pages sont absentes ou invalides.');
		}

		const name = legacyName.value;
		const libraryId = legacyLibrary.value;
		const monthId = legacyMonth.value;
		const styles = legacyStyles.value;

		if (name !== undefined && typeof name !== 'string') {
			throw new Error('L’ancien nom du document est invalide.');
		}

		if (libraryId !== undefined && libraryId !== null && typeof libraryId !== 'number') {
			throw new Error('L’ancienne médiathèque est invalide.');
		}

		if (monthId !== undefined && monthId !== null && typeof monthId !== 'number') {
			throw new Error('L’ancien mois est invalide.');
		}

		if (
			styles !== undefined &&
			(styles === null || typeof styles !== 'object' || Array.isArray(styles))
		) {
			throw new Error('Les anciens styles sont invalides.');
		}

		const migratedDocument = createLegacyDocument({
			legacyData: {
				name,
				libraryId,
				monthId,
				pages: legacyPages.value,
				styles
			},
			generateId,
			defaultStyles,
			now: new Date().toISOString()
		});

		const updatedDocuments = [...documents.current, migratedDocument];

		// On écrit d'abord les documents, puis le marqueur
		localStorage.setItem('documents', JSON.stringify(updatedDocuments));
		documents.current = updatedDocuments;

		localStorage.setItem(migrationKey, '1');

		console.info('Migration des anciennes données effectuée.');
	} catch (error) {
		console.error('Erreur lors de la migration des documents :', error);
	}
}
