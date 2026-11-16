/**
 * Crée une file d'attente pour exécuter les sauvegardes dans l'ordre.
 *
 * @template T
 * @param {(data: T) => Promise<void>} save
 * @returns {{
 *   enqueue: (data: T) => Promise<void>,
 *   wait: () => Promise<void>
 * }}
 */
export function createSaveQueue(save) {
	let queue = Promise.resolve();

	/**
	 * Ajoute une sauvegarde à la file.
	 * @param {T} data
	 * @returns {Promise<void>}
	 */
	function enqueue(data) {
		const operation = queue.catch(() => {}).then(() => save(data));

		queue = operation;

		return operation;
	}

	/**
	 * Attend la fin des sauvegardes en cours, sans propager leurs erreurs.
	 * @returns {Promise<void>}
	 */
	function wait() {
		return queue.catch(() => {});
	}

	return { enqueue, wait };
}

/**
 * Suit le dernier snapshot enregistré.
 *
 * @param {string} [initialSnapshot='']
 * @returns {{
 *   hasChanged: (snapshot: string) => boolean,
 *   markSaved: (snapshot: string) => void,
 *   reset: (snapshot?: string) => void
 * }}
 */
export function createSnapshotTracker(initialSnapshot = '') {
	let lastSavedSnapshot = initialSnapshot;

	return {
		/**
		 * Indique si le snapshot diffère du dernier snapshot enregistré.
		 * @param {string} snapshot
		 * @returns {boolean}
		 */
		hasChanged(snapshot) {
			return snapshot !== lastSavedSnapshot;
		},

		/**
		 * Définit le dernier snapshot enregistré.
		 * @param {string} snapshot
		 * @returns {void}
		 */
		markSaved(snapshot) {
			lastSavedSnapshot = snapshot;
		},

		/**
		 * Réinitialise le suivi.
		 * @param {string} [snapshot='']
		 * @returns {void}
		 */
		reset(snapshot = '') {
			lastSavedSnapshot = snapshot;
		}
	};
}
