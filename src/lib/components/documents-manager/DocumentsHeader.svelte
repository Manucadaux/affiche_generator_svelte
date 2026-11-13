<script>
	import { Palette, ChevronDown } from 'lucide-svelte';
	import { themes } from '#lib/data/themes.js';

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

		<div class="dropdown dropdown-end">
			<button class="btn btn-ghost btn-sm" aria-label="Choisir un thème">
				<Palette size={18} />
				<ChevronDown size={14} />
			</button>

			<ul
				class="dropdown-content z-50 w-48 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
			>
				<li class="menu-title">Choisir un thème</li>

				{#each themes as theme (theme.value)}
					<li>
						<input
							type="radio"
							name="theme-dropdown"
							class="theme-controller btn btn-block justify-start btn-ghost btn-sm"
							aria-label={theme.label}
							value={theme.value}
							checked={selectedTheme === theme.value}
							onchange={() => (selectedTheme = theme.value)}
						/>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</header>
