<script>
	import ThemeSelector from '#lib/components/ui/ThemeSelector.svelte';

	let { optionsLibrary, selectedLibrary = $bindable(), selectedTheme = $bindable() } = $props();
</script>

<header
	class="flex items-center justify-between gap-6 border-b border-base-300 bg-base-100 px-6 py-3"
>
	<h1 class="text-lg font-semibold">
		Générateur d’affiches d’animations du réseau des médiathèques de Pau
	</h1>

	<div class="flex items-center gap-3">
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

		<ThemeSelector bind:selectedTheme />
	</div>
</header>
