import { generateId } from '../factories.js';

/** @typedef {import('../types.js').ManagedEvent} ManagedEvent */
/** @typedef {import('../types.js').EventSection} EventSection */

/**
 * Créer un événement géré avec ses valeurs par défaut.
 *
 * @param {Partial<Omit<ManagedEvent, 'id' | 'createdAt' | 'updatedAt'>>} [initialData]
 * @returns {ManagedEvent}
 */
export function createManagedEvent(initialData = {}) {
	const now = new Date().toISOString();

	return {
		id: generateId(),
		title: '',
		libraryId: null,
		section: /** @type {EventSection | null} */ (null),
		location: '',
		condition: '',
		startDate: null,
		endDate: null,
		timeSlots: [],
		description: '',
		posterDescription: '',
		bookletDescription: '',
		onlineDescription: '',
		highlight: '',
		genre: '',
		providers: '',
		amount: '',
		actionType: '',
		partner: '',
		comment: '',
		inscription: false,
		registrationCapacity: null,
		waitingListCapacity: null,
		createdAt: now,
		updatedAt: now,
		...initialData
	};
}

/**
 * Normaliser un événement existant pour respecter le modèle actuel.
 * Cette fonction ne modifie pas les données enregistrées dans IndexedDB.
 *
 * @param {Partial<ManagedEvent> & Pick<ManagedEvent, 'id'>} event
 * @returns {ManagedEvent}
 */
export function normalizeManagedEvent(event) {
	const now = new Date().toISOString();

	const validSections = ['Jeunesse', 'Adulte', 'Tout public'];

	const section =
		typeof event.section === 'string' && validSections.includes(event.section)
			? event.section
			: null;

	const timeSlots = Array.isArray(event.timeSlots)
		? event.timeSlots.filter(
				(slot) =>
					slot &&
					(typeof slot.start === 'string' || typeof slot.end === 'string') &&
					(slot.start || slot.end)
			)
		: [];

	return {
		...createManagedEvent(),
		...event,
		id: event.id,
		libraryId: typeof event.libraryId === 'number' ? event.libraryId : null,
		section,
		startDate: event.startDate || null,
		endDate: event.endDate || null,
		timeSlots,
		location: event.location || '',
		condition: event.condition || '',
		description: event.description || '',
		posterDescription: event.posterDescription || '',
		bookletDescription: event.bookletDescription || '',
		onlineDescription: event.onlineDescription || '',
		highlight: event.highlight || '',
		genre: event.genre || '',
		providers: event.providers || '',
		amount: event.amount || '',
		actionType: event.actionType || '',
		partner: event.partner || '',
		comment: event.comment || '',
		inscription: event.inscription ?? false,
		registrationCapacity: normalizeCapacity(event.registrationCapacity),
		waitingListCapacity: normalizeCapacity(event.waitingListCapacity),
		createdAt: event.createdAt || now,
		updatedAt: event.updatedAt || now
	};
}

/**
 * Garantit une capacité entière positive ou nulle.
 * @param {unknown} value
 * @returns {number | null}
 */
function normalizeCapacity(value) {
	return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : null;
}
