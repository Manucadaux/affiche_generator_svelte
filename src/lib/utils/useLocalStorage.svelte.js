import { onMount } from 'svelte';

/**
 * @template T
 * @param {string} key
 * @param {T} initialValue
 */
export function useLocalStorage(key, initialValue) {
	let value = $state(initialValue);
	let ready = $state(false);

	onMount(() => {
		// Lecture des données sauvegardées
		try {
			const stored = localStorage.getItem(key);

			if (stored !== null) {
				value = JSON.parse(stored);
			}
		} catch (error) {
			console.error(`Erreur de lecture localStorage [${key}] :`, error);

			try {
				localStorage.removeItem(key);
			} catch (removeError) {
				console.error(`Impossible de supprimer la clé [${key}] :`, removeError);
			}

			value = initialValue;
		}

		ready = true;

		// Synchronisation entre les onglets
		/** @param {StorageEvent} event */
		const handleStorage = (event) => {
			if (event.key !== key && event.key !== null) return;

			try {
				value = event.newValue === null ? initialValue : JSON.parse(event.newValue);
			} catch (error) {
				console.error(`Erreur de synchronisation localStorage [${key}] :`, error);
				value = initialValue;
			}
		};

		window.addEventListener('storage', handleStorage);

		return () => {
			window.removeEventListener('storage', handleStorage);
		};
	});

	// Sauvegarde automatique
	$effect(() => {
		if (!ready) return;

		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.error(`Erreur d'écriture localStorage [${key}] :`, error);
		}
	});

	return {
		get current() {
			return value;
		},

		set current(newValue) {
			value = newValue;
		}
	};
}
