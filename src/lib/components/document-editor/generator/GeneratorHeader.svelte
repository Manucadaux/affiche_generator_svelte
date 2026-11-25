<script>
	import { House, Menu } from '@lucide/svelte';
	import ThemeSelector from '#lib/components/ui/ThemeSelector.svelte';

	let { selectedTheme = $bindable(), onMenuClick } = $props();

	const homeHref =
		typeof window !== 'undefined' && window.location.protocol === 'file:' ? '#home' : '/';
</script>

<header class="generatorHeader">
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={homeHref} class="homeLink">
		<House size={20} />
		<span>Nakomi</span>
	</a>

	<div class="headerActions">
		<ThemeSelector bind:selectedTheme />

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
