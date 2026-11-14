const CHANNEL_NAME = 'affiche-generator-documents';

/** @type {BroadcastChannel | null} */
let channel = null;

/**
 * Récupère le canal de communication entre les onglets.
 * @returns {BroadcastChannel | null}
 */
function getChannel() {
	if (typeof BroadcastChannel === 'undefined') return null;

	if (!channel) {
		channel = new BroadcastChannel(CHANNEL_NAME);
	}

	return channel;
}

/**
 * Informe les autres onglets qu'un document a changé.
 * @returns {void}
 */
export function notifyDocumentsChanged() {
	getChannel()?.postMessage({ type: 'documents-changed' });
}

/**
 * Écoute les changements effectués dans les autres onglets.
 * @param {() => void} callback
 * @returns {() => void} Fonction permettant de retirer l'écouteur.
 */
export function subscribeToDocumentChanges(callback) {
	const currentChannel = getChannel();

	if (!currentChannel) return () => {};

	/** @param {MessageEvent} event */
	const handleMessage = (event) => {
		if (event.data?.type === 'documents-changed') {
			callback();
		}
	};

	currentChannel.addEventListener('message', handleMessage);

	return () => {
		currentChannel.removeEventListener('message', handleMessage);
	};
}
