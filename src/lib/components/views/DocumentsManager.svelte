<script>
	import { onMount } from 'svelte';

	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { optionsLibrary } from '#lib/data/options.js';

	import DocumentsHeader from '#lib/components/documents-manager/DocumentsHeader.svelte';
	import DocumentsContent from '#lib/components/documents-manager/DocumentsContent.svelte';
	import DocumentsFooter from '#lib/components/documents-manager/DocumentsFooter.svelte';

	const selectedLibrary = useLocalStorage('selectedLibraryId', null);
	const selectedTheme = useLocalStorage('selectedTheme', 'system');

	let systemPrefersDark = $state(false);

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
		if (!selectedTheme.ready) return;

		const theme =
			selectedTheme.current === 'system'
				? systemPrefersDark
					? 'dark'
					: 'light'
				: selectedTheme.current;

		document.documentElement.setAttribute('data-theme', theme);
	});
</script>

<div class="flex min-h-screen flex-col">
	<DocumentsHeader
		{optionsLibrary}
		bind:selectedLibrary={selectedLibrary.current}
		bind:selectedTheme={selectedTheme.current}
	/>

	<main class="flex-1">
		<DocumentsContent />
	</main>

	<DocumentsFooter />
</div>
