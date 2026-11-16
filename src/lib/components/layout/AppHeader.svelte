<script>
	import ThemeSelector from '#lib/components/ui/ThemeSelector.svelte';

	let {
		title,
		optionsLibrary = null,
		selectedLibrary = $bindable(),
		selectedTheme = $bindable()
	} = $props();
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
		{#if optionsLibrary}
			<select
				class="select-bordered select select-sm"
				aria-label="Sélectionner une médiathèque"
				bind:value={selectedLibrary}
			>
				<option value={null}>Toutes les médiathèques</option>

				{#each optionsLibrary as option (option.id)}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		{/if}

		<ThemeSelector bind:selectedTheme />
	</div>
</header>
