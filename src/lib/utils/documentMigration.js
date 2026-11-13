/** @typedef {import('./types.js').AppDocument} AppDocument */
/** @typedef {import('./types.js').Page} Page */
/** @typedef {import('./types.js').Event} Event */
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
 * Vérifie la structure d'un ancien événement.
 * @param {unknown} value
 * @returns {value is Event}
 */
function isValidEvent(value) {
	return (
		isRecord(value) &&
		typeof value.id === 'string' &&
		typeof value.imageVersion === 'number' &&
		typeof value.title === 'string' &&
		typeof value.sizeTitle === 'number' &&
		typeof value.date === 'string' &&
		typeof value.hour === 'string' &&
		typeof value.content === 'string' &&
		typeof value.sizeDescription === 'number' &&
		typeof value.condition === 'string' &&
		typeof value.inscription === 'boolean'
	);
}

/**
 * Vérifie la structure des anciennes pages et de leurs événements.
 * @param {unknown} value
 * @returns {value is Page[]}
 */
function isValidPages(value) {
	return (
		Array.isArray(value) &&
		value.every(
			(page) =>
				isRecord(page) &&
				typeof page.id === 'string' &&
				typeof page.reverse === 'boolean' &&
				Array.isArray(page.events) &&
				page.events.every(isValidEvent)
		)
	);
}

/**
 * Vérifie la structure des anciens styles.
 * @param {unknown} value
 * @returns {value is Partial<Styles>}
 */
function isValidStyles(value) {
	if (!isRecord(value)) return false;

	const stringProperties = /** @type {const} */ ([
		'bgDate',
		'bgTitle',
		'colorDate',
		'colorTitle',
		'colorContent'
	]);

	return (
		stringProperties.every(
			(property) => value[property] === undefined || typeof value[property] === 'string'
		) &&
		(value.zoom === undefined || typeof value.zoom === 'number')
	);
}

/**
 * Lit une ancienne valeur dans localStorage.
 * @param {string} key
 */
function readLegacyValue(key) {
	const raw = localStorage.getItem(key);
	return { exists: raw !== null, value: raw === null ? undefined : JSON.parse(raw) };
}

/**
 * Compare deux objets simples en vérifiant leurs propriétés.
 * @param {Record<string, unknown>} first
 * @param {Record<string, unknown>} second
 */
function hasSameProperties(first, second) {
	const keys = new Set([...Object.keys(first), ...Object.keys(second)]);

	return [...keys].every((key) => first[key] === second[key]);
}

/**
 * Détermine si les anciennes données correspondent encore
 * exactement à l'état initial du Generator.
 * @param {LegacyDocumentData} legacyData
 * @param {Omit<Event, 'id'>} defaultEvent
 * @param {Styles} defaultStyles
 * @returns {boolean}
 */
function isUntouchedLegacyDocument(
	{ name, libraryId, monthId, pages, styles },
	defaultEvent,
	defaultStyles
) {
	if (name !== undefined && name !== 'Mon document') return false;
	if (libraryId != null || monthId != null) return false;

	if (pages.length !== 1) return false;

	const [page] = pages;

	if (page.reverse !== false || page.events.length !== 1) return false;

	const [event] = page.events;

	if (!hasSameProperties(event, { ...defaultEvent, id: event.id })) return false;

	if (styles && !hasSameProperties({ ...defaultStyles, ...styles }, defaultStyles)) {
		return false;
	}

	return true;
}

/**
 * Construit un document à partir des anciennes données du Generator.
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
		styles: { ...defaultStyles, ...styles },
		createdAt: now,
		updatedAt: now
	};
}

/**
 * Migre les anciennes données du Generator vers le nouveau système de documents.
 * @param {Object} options
 * @param {{ current: AppDocument[] }} options.documents
 * @param {() => string} options.generateId
 * @param {Styles} options.defaultStyles
 * @param {Omit<Event, 'id'>} options.defaultEvent
 * @returns {void}
 */
export function migrateLegacyDocument({ documents, generateId, defaultStyles, defaultEvent }) {
	const migrationKey = 'documentsMigrationVersion';

	if (localStorage.getItem(migrationKey) === '1') return;

	try {
		if (!Array.isArray(documents.current)) {
			throw new Error('Le stockage des documents est invalide.');
		}

		if (documents.current.length > 0) {
			localStorage.setItem(migrationKey, '1');
			return;
		}

		const legacyName = readLegacyValue('documentName');
		const legacyLibrary = readLegacyValue('selectedLibraryId');
		const legacyMonth = readLegacyValue('selectedMonthId');
		const legacyPages = readLegacyValue('pages');
		const legacyStyles = readLegacyValue('styles');

		const legacyValues = [legacyName, legacyLibrary, legacyMonth, legacyPages, legacyStyles];

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

		if (styles !== undefined && !isValidStyles(styles)) {
			throw new Error('Les anciens styles sont invalides.');
		}

		const legacyData = { name, libraryId, monthId, pages: legacyPages.value, styles };

		if (isUntouchedLegacyDocument(legacyData, defaultEvent, defaultStyles)) {
			localStorage.setItem(migrationKey, '1');
			console.info('Aucun ancien document à migrer.');
			return;
		}

		const migratedDocument = createLegacyDocument({
			legacyData,
			generateId,
			defaultStyles,
			now: new Date().toISOString()
		});

		const updatedDocuments = [...documents.current, migratedDocument];

		localStorage.setItem('documents', JSON.stringify(updatedDocuments));
		documents.current = updatedDocuments;

		localStorage.setItem(migrationKey, '1');
		console.info('Migration des anciennes données effectuée.');
	} catch (error) {
		console.error('Erreur lors de la migration des documents :', error);
	}
}
