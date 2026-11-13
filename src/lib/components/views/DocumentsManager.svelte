<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */

	import { onMount } from 'svelte';

	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { optionsLibrary, defaultStyles } from '#lib/data/options.js';
	import { createPage, generateId } from '#lib/utils/factories.js';
	import { createDocumentActions } from '#lib/utils/documentActions.js';
	import { createLegacyDocument } from '#lib/utils/documentMigration.js';

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

	/**
	 * @param {string} key
	 */
	function readLegacyValue(key) {
		const raw = localStorage.getItem(key);

		return {
			exists: raw !== null,
			value: raw === null ? undefined : JSON.parse(raw)
		};
	}

	/**
	 * @param {unknown} value
	 * @returns {value is Record<string, unknown>}
	 */
	function isRecord(value) {
		return value !== null && typeof value === 'object' && !Array.isArray(value);
	}

	/**
	 * @param {unknown} value
	 * @returns {value is import('#lib/utils/types.js').Page[]}
	 */
	function isValidPages(value) {
		return (
			Array.isArray(value) &&
			value.every(
				/**
				 * @param {unknown} page
				 */
				(page) =>
					isRecord(page) &&
					typeof page.id === 'string' &&
					Array.isArray(page.events) &&
					page.events.every(
						/**
						 * @param {unknown} event
						 */
						(event) => isRecord(event) && typeof event.id === 'string'
					)
			)
		);
	}

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

		const migrationKey = 'documentsMigrationVersion';

		// Migration déjà effectuée
		if (localStorage.getItem(migrationKey) === '1') return;

		// Des documents existent déjà : ne rien migrer
		if (documents.current.length > 0) {
			localStorage.setItem(migrationKey, '1');
			return;
		}

		try {
			const legacyName = readLegacyValue('documentName');
			const legacyLibrary = readLegacyValue('selectedLibraryId');
			const legacyMonth = readLegacyValue('selectedMonthId');
			const legacyPages = readLegacyValue('pages');
			const legacyStyles = readLegacyValue('styles');

			const legacyValues = [legacyName, legacyLibrary, legacyMonth, legacyPages, legacyStyles];

			// Aucune ancienne donnée : il n'y a rien à migrer
			if (!legacyValues.some((item) => item.exists)) {
				localStorage.setItem(migrationKey, '1');
				return;
			}

			if (!legacyPages.exists || !isValidPages(legacyPages.value)) {
				throw new Error('Les anciennes pages sont absentes ou invalides.');
			}

			const name = legacyName.value;
			const libraryId = legacyLibrary.value;
			const monthId = legacyMonth.value;
			const styles = legacyStyles.value;

			if (name !== undefined && typeof name !== 'string') {
				throw new Error('L’ancien nom du document est invalide.');
			}

			if (libraryId !== undefined && libraryId !== null && typeof libraryId !== 'number') {
				throw new Error('L’ancienne médiathèque est invalide.');
			}

			if (monthId !== undefined && monthId !== null && typeof monthId !== 'number') {
				throw new Error('L’ancien mois est invalide.');
			}

			if (
				styles !== undefined &&
				(styles === null || typeof styles !== 'object' || Array.isArray(styles))
			) {
				throw new Error('Les anciens styles sont invalides.');
			}

			const migratedDocument = createLegacyDocument({
				legacyData: {
					name,
					libraryId,
					monthId,
					pages: legacyPages.value,
					styles
				},
				generateId,
				defaultStyles,
				now: new Date().toISOString()
			});

			const updatedDocuments = [...documents.current, migratedDocument];

			// On écrit d'abord les documents, puis le marqueur
			localStorage.setItem('documents', JSON.stringify(updatedDocuments));
			documents.current = updatedDocuments;

			localStorage.setItem(migrationKey, '1');

			console.info('Migration des anciennes données effectuée.');
		} catch (error) {
			console.error('Erreur lors de la migration des documents :', error);
		}
	});
</script>

<div class="flex min-h-screen flex-col">
	<DocumentsHeader
		{optionsLibrary}
		bind:selectedLibrary={selectedLibraryForNewDocument.current}
		bind:selectedTheme={selectedTheme.current}
	/>

	<main class="flex-1">
		<DocumentsContent />
	</main>

	<DocumentsFooter />
</div>
