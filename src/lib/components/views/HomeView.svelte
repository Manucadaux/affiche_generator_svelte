<script>
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { applyTheme } from '#lib/utils/theme/applyTheme.svelte.js';

	import ThemeSelector from '#lib/components/ui/ThemeSelector.svelte';
	import AppFooter from '#lib/components/layout/AppFooter.svelte';
	import CardLink from '#lib/components/home/CardLink.svelte';

	const selectedTheme = useLocalStorage('selectedTheme', 'system');
	applyTheme(selectedTheme);
</script>

<svelte:head>
	<title>Nakomi</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-base-200">
	<header class="flex items-center justify-between border-b border-base-300 bg-base-100 px-8 py-5">
		<h1 class="text-2xl font-semibold">Nakomi</h1>

		<ThemeSelector bind:selectedTheme={selectedTheme.current} />
	</header>

	<main class="mx-auto w-full max-w-5xl flex-1 px-8 py-12">
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<CardLink
				title="Événements"
				description="Accès au gestionnaire d'évènements"
				href="/events-manager"
			/>

			<CardLink
				title="Affiches"
				description="Accès au générateur d'affiches"
				href="/documents-manager"
			/>
		</div>
	</main>

	<AppFooter />
</div>
