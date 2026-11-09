<script>
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { optionsLibrary, optionsMonth } from '#lib/data/options.js';
	import { slide } from 'svelte/transition';
	import Generator from '#lib/layout/Generator.svelte';
	import ContainerAffiche from '../lib/layout/ContainerAffiche.svelte';

	const selectedLibrary = useLocalStorage('selectedLibraryId', null);
	const selectedMonth = useLocalStorage('selectedMonthId', null);

	let selectedLibraryData = $derived(
		optionsLibrary.find((option) => option.id === selectedLibrary.current) ?? null
	);

	let selectedMonthData = $derived(
		optionsMonth.find((option) => option.id === selectedMonth.current) ?? null
	);

	const styles = useLocalStorage('styles', {
		bgDate: '#00FF00',
		bgTitle: '#FF0000',
		colorDate: '#FFFFFF',
		colorTitle: '#FFFFFF',
		colorContent: '#0000FF',
		zoom: '40%'
	});

	function generateId() {
		return crypto.randomUUID();
	}

	const pages = useLocalStorage('pages', [
		{
			id: generateId(),
			events: [
				{
					id: generateId(),
					title: 'banana',
					date: 'Sa. 31 oct.',
					hour: '10h',
					content: 'Me gusta banana'
				}
			]
		}
	]);

	let nbPages = $derived(pages.current.length);

	function addPage() {
		pages.current = [
			...pages.current,
			{
				id: generateId(),
				events: [
					{
						id: generateId(),
						title: 'banana',
						date: 'Sa. 31 oct.',
						hour: '10h',
						content: 'Me gusta banana'
					}
				]
			}
		];
	}

	function deletePage(pageId) {
		pages.current = pages.current.filter((page) => page.id !== pageId);
	}
</script>

<Generator
	{nbPages}
	{addPage}
	{optionsLibrary}
	{optionsMonth}
	bind:selectedLibrary={selectedLibrary.current}
	bind:selectedMonth={selectedMonth.current}
	bind:styles={styles.current}
/>

<div class="container">
	{#each pages.current as page, i (page.id)}
		<div transition:slide={{ duration: 500 }}>
			<ContainerAffiche
				pageNumber={i + 1}
				selectedLibrary={selectedLibraryData}
				selectedMonth={selectedMonthData}
				{page}
				styles={styles.current}
				canDelete={pages.current.length > 1}
				onDeletePage={deletePage}
			/>
		</div>
	{/each}
</div>

<style>
	:global {
		html,
		body {
			height: 100%;
			width: 100%;
		}
	}

	.container {
		width: calc(100% - 360px);
		position: absolute;
		top: 10px;
		left: 350px;
		padding-bottom: 40px;
	}
</style>
