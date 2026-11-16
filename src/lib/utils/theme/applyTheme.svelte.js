import { onMount } from 'svelte';

/**
 * Applique le thème choisi à l'ensemble de l'application.
 * @param {{ current: string, ready: boolean }} selectedTheme
 * @returns {void}
 */
export function applyTheme(selectedTheme) {
	/** @type {boolean | null} */
	let systemPrefersDark = $state(null);

	onMount(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		systemPrefersDark = mediaQuery.matches;

		/** @param {MediaQueryListEvent} event */
		const handleSystemChange = (event) => {
			systemPrefersDark = event.matches;
		};

		mediaQuery.addEventListener('change', handleSystemChange);

		return () => {
			mediaQuery.removeEventListener('change', handleSystemChange);
		};
	});

	$effect(() => {
		if (!selectedTheme.ready || systemPrefersDark === null) return;

		const theme =
			selectedTheme.current === 'system'
				? systemPrefersDark
					? 'dark'
					: 'light'
				: selectedTheme.current;

		document.documentElement.setAttribute('data-theme', theme);
	});
}
