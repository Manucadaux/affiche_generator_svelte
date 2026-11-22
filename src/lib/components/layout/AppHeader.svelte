<script>
	import ThemeSelector from '#lib/components/ui/ThemeSelector.svelte';
	import ActiveLibrarySelector from '#lib/components/layout/ActiveLibrarySelector.svelte';

	let { title, selectedLibrary = $bindable(), selectedTheme = $bindable() } = $props();
</script>

<header
	class="flex items-center justify-between gap-6 border-b border-base-300 bg-base-100 px-6 py-3"
>
	<div class="flex items-center gap-4">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/" class="text-lg font-semibold hover:text-primary"> Nakomi </a>

		<span class="text-base-content/40">/</span>

		<h1 class="text-lg font-semibold">{title}</h1>
	</div>

	<div class="flex items-center gap-3">
		<ActiveLibrarySelector />

		<ThemeSelector bind:selectedTheme />
	</div>
</header>
