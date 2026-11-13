<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */

	import { onMount } from 'svelte';

	import { optionsLibrary, defaultStyles, defaultEventOptions } from '#lib/data/options.js';
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { createPage, generateId } from '#lib/utils/factories.js';
	import { createDocumentActions } from '#lib/utils/documentActions.js';
	import { migrateLegacyDocument } from '#lib/utils/documentMigration.js';

	import DocumentsHeader from '#lib/components/documents-manager/DocumentsHeader.svelte';
	import DocumentsContent from '#lib/components/documents-manager/DocumentsContent.svelte';
	import DocumentsFooter from '#lib/components/documents-manager/DocumentsFooter.svelte';

	const selectedLibraryForNewDocument = useLocalStorage('newDocumentLibraryId', null);
	const selectedTheme = useLocalStorage('selectedTheme', 'system');

	/** @type {AppDocument[]} */
	const initialDocuments = [];

	const documents = useLocalStorage('documents', initialDocuments);

	const { createDocument, getDocument, updateDocument, deleteDocument } = createDocumentActions({
		documents,
		createPage,
		generateId,
		defaultStyles
	});

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

	$effect(() => {
		if (!documents.ready) return;

		migrateLegacyDocument({
			documents,
			generateId,
			defaultStyles,
			defaultEvent: defaultEventOptions
		});
	});
</script>

<div class="flex min-h-screen flex-col">
	<DocumentsHeader
		{optionsLibrary}
		bind:selectedLibrary={selectedLibraryForNewDocument.current}
		bind:selectedTheme={selectedTheme.current}
	/>

	<main class="flex-1">
		<DocumentsContent
			documents={documents.current}
			{createDocument}
			{updateDocument}
			{deleteDocument}
		/>
	</main>

	<DocumentsFooter />
</div>
