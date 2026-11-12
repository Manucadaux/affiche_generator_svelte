<script>
	import GeneratorOptions from '#lib/components/generator/GeneratorOptions.svelte';
	import GeneratorColors from '#lib/components/generator/GeneratorColors.svelte';
	import GeneratorActions from '#lib/components/generator/GeneratorActions.svelte';

	let {
		nbPages,
		optionsLibrary,
		optionsMonth,
		selectedLibrary = $bindable(),
		selectedMonth = $bindable(),
		styles = $bindable(),
		selectedTheme = $bindable(),
		onResetEvents,
		onResetAll,
		renderHref
	} = $props();
</script>

<div class="generator bg-base-300">
	<GeneratorOptions
		{nbPages}
		{optionsLibrary}
		{optionsMonth}
		bind:selectedLibrary
		bind:selectedMonth
		bind:styles
		bind:selectedTheme
	/>

	<GeneratorColors bind:styles />

	<GeneratorActions {onResetEvents} {onResetAll} {renderHref} />
</div>

<style>
	.generator {
		width: 310px;
		padding: 0 20px;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		overflow-y: auto;
	}
</style>
