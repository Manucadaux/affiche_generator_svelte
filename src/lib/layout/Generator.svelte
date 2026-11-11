<script>
	import GeneratorOptions from '../components/GeneratorOptions.svelte';
	import GeneratorColors from '../components/GeneratorColors.svelte';
	import GeneratorActions from '../components/GeneratorActions.svelte';

	let {
		nbPages,
		addPage,
		optionsLibrary,
		optionsMonth,
		selectedLibrary = $bindable(),
		selectedMonth = $bindable(),
		styles = $bindable(),
		onResetEvents,
		onResetAll
	} = $props();
</script>

<div class="generator bg-base-300">
	<GeneratorOptions
		{nbPages}
		{addPage}
		{optionsLibrary}
		{optionsMonth}
		bind:selectedLibrary
		bind:selectedMonth
		bind:styles
	/>

	<GeneratorColors bind:styles />

	<GeneratorActions {onResetEvents} {onResetAll} />
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
