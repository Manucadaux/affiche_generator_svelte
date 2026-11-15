/**
 * @typedef {Object} HistoryAction
 * @property {() => void | Promise<void>} undo
 * @property {() => void | Promise<void>} redo
 */

/**
 * @typedef {Object} HistoryState
 * @property {boolean} canUndo
 * @property {boolean} canRedo
 */

/**
 * @typedef {Object} HistoryOptions
 * @property {number} [limit=50] Nombre maximal d'actions conservées.
 * @property {(state: HistoryState) => void} [onChange] Callback appelé lorsque l'état de l'historique change.
 */

/**
 * Crée un moteur Undo/Redo indépendant des données de l'application.
 * @param {HistoryOptions} [options]
 */
export function createHistory(options = {}) {
	const limit = options.limit ?? 50;
	const onChange = options.onChange ?? (() => {});

	/** @type {HistoryAction[]} */
	const undoStack = [];

	/** @type {HistoryAction[]} */
	const redoStack = [];

	/** @type {HistoryAction[] | null} */
	let currentGroup = null;

	let isBusy = false;

	/** @returns {HistoryState} */
	function getState() {
		return {
			canUndo: undoStack.length > 0,
			canRedo: redoStack.length > 0
		};
	}

	/** Notifie l'application de l'évolution de l'historique. */
	function notifyChange() {
		onChange(getState());
	}

	/**
	 * Ajoute une action à l'historique.
	 * @param {HistoryAction} action
	 */
	function push(action) {
		if (isBusy) {
			throw new Error('Impossible de modifier l’historique pendant une opération Undo/Redo.');
		}

		if (typeof action.undo !== 'function' || typeof action.redo !== 'function') {
			throw new TypeError('Une action doit fournir les fonctions undo et redo.');
		}

		if (currentGroup) {
			currentGroup.push(action);
			return;
		}

		undoStack.push(action);

		if (undoStack.length > limit) {
			undoStack.shift();
		}

		redoStack.length = 0;
		notifyChange();
	}

	/**
	 * Annule la dernière action.
	 * @returns {Promise<boolean>} Indique si une action a été annulée.
	 */
	async function undo() {
		if (isBusy || currentGroup) return false;

		const action = undoStack.at(-1);

		if (!action) return false;

		isBusy = true;

		try {
			await action.undo();

			undoStack.pop();
			redoStack.push(action);

			notifyChange();
			return true;
		} finally {
			isBusy = false;
		}
	}

	/**
	 * Rétablit la dernière action annulée.
	 * @returns {Promise<boolean>} Indique si une action a été rétablie.
	 */
	async function redo() {
		if (isBusy || currentGroup) return false;

		const action = redoStack.at(-1);

		if (!action) return false;

		isBusy = true;

		try {
			await action.redo();

			redoStack.pop();
			undoStack.push(action);

			notifyChange();
			return true;
		} finally {
			isBusy = false;
		}
	}

	/** Commence un groupe d'actions. */
	function beginGroup() {
		if (isBusy) {
			throw new Error('Impossible de commencer un groupe pendant une opération Undo/Redo.');
		}

		if (currentGroup) {
			throw new Error('Un groupe d’actions est déjà ouvert.');
		}

		currentGroup = [];
	}

	/** Termine le groupe et l'enregistre comme une seule action. */
	function endGroup() {
		if (isBusy) {
			throw new Error('Impossible de terminer un groupe pendant une opération Undo/Redo.');
		}

		if (!currentGroup) {
			throw new Error('Aucun groupe d’actions n’est ouvert.');
		}

		const actions = currentGroup;
		currentGroup = null;

		if (actions.length === 0) return;

		/** @type {HistoryAction} */
		const groupedAction = {
			undo: async () => {
				for (const action of [...actions].reverse()) {
					await action.undo();
				}
			},
			redo: async () => {
				for (const action of actions) {
					await action.redo();
				}
			}
		};

		push(groupedAction);
	}

	/** Vide entièrement l'historique et le groupe éventuellement ouvert. */
	function clear() {
		if (isBusy) {
			throw new Error('Impossible de vider l’historique pendant une opération Undo/Redo.');
		}

		undoStack.length = 0;
		redoStack.length = 0;
		currentGroup = null;

		notifyChange();
	}

	notifyChange();

	return {
		get canUndo() {
			return undoStack.length > 0;
		},
		get canRedo() {
			return redoStack.length > 0;
		},
		push,
		undo,
		redo,
		beginGroup,
		endGroup,
		clear
	};
}

/**
 * Enregistre une modification simple dans l'historique.
 *
 * @template T
 * @param {ReturnType<typeof createHistory>} history
 * @param {T} previousValue
 * @param {T} newValue
 * @param {(value: T) => void} apply
 * @returns {void}
 */
export function recordChange(history, previousValue, newValue, apply) {
	if (previousValue === newValue) return;

	apply(newValue);

	history.push({
		undo: () => apply(previousValue),
		redo: () => apply(newValue)
	});
}
