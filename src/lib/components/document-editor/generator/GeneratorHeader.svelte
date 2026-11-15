<script>
	import { themes } from '#lib/data/themes.js';
	import { House, Palette, Menu } from 'lucide-svelte';

	let { selectedTheme = $bindable(), onMenuClick } = $props();
</script>

<header class="generatorHeader">
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href="/" class="homeLink">
		<House size={20} />
		<span>Nakomi</span>
	</a>

	<div class="headerActions">
		<div class="dropdown dropdown-end">
			<button class="headerBtn" aria-label="Choisir un thème" aria-haspopup="true">
				<Palette size={19} />
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
							class:active={selectedTheme === theme.value}
							onclick={() => (selectedTheme = theme.value)}
						>
							{theme.label}
						</button>
					</li>
				{/each}
			</ul>
		</div>

		<button class="headerBtn" aria-label="Ouvrir le menu" onclick={onMenuClick}>
			<Menu size={21} />
		</button>
	</div>
</header>

<style>
	.generatorHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 15px 0;
		border-bottom: 1px solid color-mix(in oklch, var(--color-base-content) 15%, transparent);
	}

	.homeLink {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 18px;
		font-weight: 700;
		color: inherit;
		text-decoration: none;
	}

	.headerActions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.headerBtn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		border-radius: 8px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.headerBtn:hover {
		background-color: color-mix(in oklch, var(--color-base-content) 10%, transparent);
	}
</style>
