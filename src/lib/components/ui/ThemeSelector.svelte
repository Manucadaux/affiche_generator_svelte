<script>
	import { Palette, Check } from '@lucide/svelte';
	import { themes } from '#lib/data/themes.js';

	let { selectedTheme = $bindable() } = $props();
</script>

<div class="dropdown dropdown-end">
	<button class="btn btn-ghost btn-sm" aria-label="Choisir un thème" aria-haspopup="true">
		<Palette size={18} />
	</button>

	<ul
		tabindex="-1"
		class="dropdown-content z-50 mt-2 w-48 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
	>
		<li class="menu-title">Choisir un thème</li>

		{#each themes as theme (theme.value)}
			<li>
				<button
					class="btn btn-block justify-start btn-ghost btn-sm"
					class:bg-base-200={selectedTheme === theme.value}
					class:font-semibold={selectedTheme === theme.value}
					aria-pressed={selectedTheme === theme.value}
					onclick={() => (selectedTheme = theme.value)}
				>
					{theme.label}

					{#if selectedTheme === theme.value}
						<Check size={16} class="ml-auto" />
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>
