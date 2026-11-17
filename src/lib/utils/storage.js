import { getDatabase } from './indexedDB.js';

/**
 * Créer un ensemble de fonctions CRUD pour un espace de stockage IndexedDB.
 * @template {{ id: string }} T
 * @param {string} storeName
 * @returns {{
 *   getAll: () => Promise<T[]>,
 *   getById: (id: string) => Promise<T | null>,
 *   add: (item: T) => Promise<void>,
 *   update: (item: T) => Promise<boolean>,
 *   remove: (id: string) => Promise<void>
 * }}
 */
export function createStorage(storeName) {
	/**
	 * Récupérer tous les éléments.
	 * @returns {Promise<T[]>}
	 */
	async function getAll() {
		const db = await getDatabase();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readonly');
			const request = transaction.objectStore(storeName).getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * Récupérer un élément par son identifiant.
	 * @param {string} id
	 * @returns {Promise<T | null>}
	 */
	async function getById(id) {
		const db = await getDatabase();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readonly');
			const request = transaction.objectStore(storeName).get(id);

			request.onsuccess = () => resolve(request.result ?? null);
			request.onerror = () => reject(request.error);
		});
	}

	/**
	 * Ajouter un nouvel élément.
	 * @param {T} item
	 * @returns {Promise<void>}
	 */
	async function add(item) {
		const db = await getDatabase();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readwrite');

			transaction.objectStore(storeName).add(item);

			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		});
	}

	/**
	 * Mettre à jour un élément existant sans le recréer s'il n'existe plus.
	 * @param {T} item
	 * @returns {Promise<boolean>}
	 */
	async function update(item) {
		const db = await getDatabase();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readwrite');
			const store = transaction.objectStore(storeName);
			const request = store.get(item.id);

			let wasUpdated = false;

			request.onsuccess = () => {
				if (!request.result) return;

				store.put(item);
				wasUpdated = true;
			};

			transaction.oncomplete = () => resolve(wasUpdated);
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		});
	}

	/**
	 * Supprimer un élément par son identifiant.
	 * @param {string} id
	 * @returns {Promise<void>}
	 */
	async function remove(id) {
		const db = await getDatabase();

		return new Promise((resolve, reject) => {
			const transaction = db.transaction(storeName, 'readwrite');

			transaction.objectStore(storeName).delete(id);

			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
			transaction.onabort = () => reject(transaction.error);
		});
	}

	return {
		getAll,
		getById,
		add,
		update,
		remove
	};
}
