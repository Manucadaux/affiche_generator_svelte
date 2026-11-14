const DB_NAME = 'affiche-generator';
const DB_VERSION = 2;

/** @type {Promise<IDBDatabase> | null} */
let dbPromise = null;

/**
 * Ouvre la base de données IndexedDB.
 * Crée les espaces de stockage nécessaires lors de la mise à niveau.
 * @returns {Promise<IDBDatabase>}
 */
export function getDatabase() {
	if (dbPromise) return dbPromise;

	dbPromise = new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = () => {
			const db = request.result;

			if (!db.objectStoreNames.contains('eventImages')) {
				db.createObjectStore('eventImages');
			}

			if (!db.objectStoreNames.contains('documents')) {
				db.createObjectStore('documents', { keyPath: 'id' });
			}
		};

		request.onsuccess = () => {
			const db = request.result;

			db.onversionchange = () => {
				db.close();
				dbPromise = null;
			};

			resolve(db);
		};

		request.onerror = () => {
			dbPromise = null;
			reject(request.error);
		};

		request.onblocked = () => {
			console.warn('La mise à niveau de la base IndexedDB est bloquée.');
		};
	});

	return dbPromise;
}
