/**
 * Installe les raccourcis clavier Undo/Redo.
 *
 * @param {object} options
 * @param {() => Promise<void>} options.undo
 * @param {() => Promise<void>} options.redo
 * @param {() => boolean} options.canUndo
 * @param {() => boolean} options.canRedo
 * @returns {() => void} Fonction de nettoyage de l'écouteur.
 */
export function setupHistoryKeyboard({ undo, redo, canUndo, canRedo }) {
	/**
	 * @param {KeyboardEvent} event
	 */
	function handleKeydown(event) {
		const target = event.target;

		const isTextInput =
			target instanceof HTMLInputElement &&
			![
				'number',
				'checkbox',
				'radio',
				'button',
				'submit',
				'reset',
				'range',
				'color',
				'file'
			].includes(target.type);

		if (
			isTextInput ||
			target instanceof HTMLTextAreaElement ||
			(target instanceof HTMLElement &&
				(target.isContentEditable ||
					target.closest('select, [contenteditable="true"], [role="textbox"]')))
		) {
			return;
		}

		if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

		const key = event.key.toLowerCase();

		if (key === 'z' && !event.shiftKey && canUndo()) {
			event.preventDefault();
			void undo();
		} else if (((key === 'y' && !event.shiftKey) || (key === 'z' && event.shiftKey)) && canRedo()) {
			event.preventDefault();
			void redo();
		}
	}

	window.addEventListener('keydown', handleKeydown);

	return () => {
		window.removeEventListener('keydown', handleKeydown);
	};
}
