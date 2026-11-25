import { onMount } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

/**
 * @template T
 * @typedef {{
 *     get current(): T,
 *     set current(value: T),
 *     get ready(): boolean,
 *     set ready(value: boolean)
 * }} SharedStore
 */

/** @type {SvelteMap<string, object>} */
const sharedStores = new SvelteMap();

/**
 * Crée un état partagé.
 *
 * @template T
 * @param {T} initialValue
 * @returns {SharedStore<T>}
 */
function createSharedStore(initialValue) {
	let value = $state(initialValue);
	let ready = $state(false);

	return {
		get current() {
			return value;
		},

		set current(newValue) {
			value = newValue;
		},

		get ready() {
			return ready;
		},

		set ready(newValue) {
			ready = newValue;
		}
	};
}

/**
 * Récupère ou crée un état partagé pour une clé localStorage.
 *
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {SharedStore<T>}
 */
function getSharedStore(key, initialValue) {
	/** @type {SharedStore<T> | undefined} */
	let store = /** @type {SharedStore<T> | undefined} */ (
		/** @type {unknown} */ (sharedStores.get(key))
	);

	if (!store) {
		store = createSharedStore(initialValue);
		sharedStores.set(key, store);
	}

	return store;
}

/**
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @returns {SharedStore<T>}
 */
export function useLocalStorage(key, initialValue) {
	const store = getSharedStore(key, initialValue);

	onMount(() => {
		if (!store.ready) {
			try {
				const stored = localStorage.getItem(key);

				if (stored !== null) {
					store.current = JSON.parse(stored);
				}
			} catch (error) {
				console.error(`Erreur de lecture localStorage [${key}] :`, error);

				try {
					localStorage.removeItem(key);
				} catch (removeError) {
					console.error(`Impossible de supprimer la clé [${key}] :`, removeError);
				}

				store.current = initialValue;
			}

			store.ready = true;
		}

		/** @param {StorageEvent} event */
		const handleStorage = (event) => {
			if (event.key !== key && event.key !== null) return;

			try {
				store.current = event.newValue === null ? initialValue : JSON.parse(event.newValue);
			} catch (error) {
				console.error(`Erreur de synchronisation localStorage [${key}] :`, error);
				store.current = initialValue;
			}
		};

		window.addEventListener('storage', handleStorage);

		return () => {
			window.removeEventListener('storage', handleStorage);
		};
	});

	$effect(() => {
		if (!store.ready) return;

		try {
			localStorage.setItem(key, JSON.stringify(store.current));
		} catch (error) {
			console.error(`Erreur d'écriture localStorage [${key}] :`, error);
		}
	});

	return store;
}
