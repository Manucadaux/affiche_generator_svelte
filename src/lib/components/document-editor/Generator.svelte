<script>
	import GeneratorHeader from '#lib/components/document-editor/generator/GeneratorHeader.svelte';
	import DocumentOptions from '#lib/components/document-editor/generator/DocumentOptions.svelte';
	import DisplayOptions from '#lib/components/document-editor/generator/DisplayOptions.svelte';
	import GeneratorOptions from '#lib/components/document-editor/generator/GeneratorOptions.svelte';
	import GeneratorColors from '#lib/components/document-editor/generator/GeneratorColors.svelte';
	import GeneratorMenu from '#lib/components/document-editor/generator/GeneratorMenu.svelte';

	let {
		nbPages,
		optionsLibrary,
		optionsMonth,
		selectedLibrary = $bindable(),
		selectedMonth = $bindable(),
		styles = $bindable(),
		selectedTheme = $bindable(),
		documentName = $bindable(),
		onAddPage,
		onDeleteLastPage,
		renderHref,
		documents = [],
		currentDocumentId,
		onNavigateHome,
		onNavigate,
		onUpdateDocument,
		onUpdateStyle,
		onBeginColorEdit,
		onEndColorEdit
	} = $props();

	let isMenuOpen = $state(false);
</script>

<div class="generator bg-base-300">
	<GeneratorHeader bind:selectedTheme onMenuClick={() => (isMenuOpen = !isMenuOpen)} />

	{#if isMenuOpen}
		<GeneratorMenu
			{documents}
			{currentDocumentId}
			{onNavigateHome}
			{onNavigate}
			onClose={() => (isMenuOpen = false)}
		/>
	{/if}

	<DocumentOptions
		{nbPages}
		bind:documentName
		{onAddPage}
		{onDeleteLastPage}
		{onUpdateDocument}
		{renderHref}
	/>

	<DisplayOptions bind:styles />

	<GeneratorOptions
		{optionsLibrary}
		{optionsMonth}
		bind:selectedLibrary
		bind:selectedMonth
		{onUpdateDocument}
	/>

	<GeneratorColors bind:styles {onUpdateStyle} {onBeginColorEdit} {onEndColorEdit} />

	<p class="mt-6 mb-6 text-sm text-base-content/60">
		Un problème ou un bug ? Veuillez me contacter par mail
		<a href="mailto:m.ortiz@agglo-pau.fr" class="link">m.ortiz@agglo-pau.fr</a>
		ou par Teams !
	</p>
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
