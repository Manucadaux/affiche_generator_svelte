import { onMount } from 'svelte';

export function useLocalStorage<T>(key: string, initialValue: T) {
	let value = $state<T>(initialValue);
	let ready = $state(false);

	onMount(() => {
		try {
			const stored = localStorage.getItem(key);

			if (stored !== null) {
				value = JSON.parse(stored) as T;
			}
		} catch (error) {
			console.warn('localStorage read error:', error);
		}

		ready = true;

		const handleStorage = (event: StorageEvent) => {
			if (event.key !== key) return;

			try {
				value = event.newValue === null ? initialValue : (JSON.parse(event.newValue) as T);
			} catch {
				value = initialValue;
			}
		};

		window.addEventListener('storage', handleStorage);

		return () => {
			window.removeEventListener('storage', handleStorage);
		};
	});

	$effect(() => {
		if (!ready) return;

		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (error) {
			console.warn('localStorage write error:', error);
		}
	});

	return {
		get current() {
			return value;
		},
		set current(newValue: T) {
			value = newValue;
		}
	};
}
