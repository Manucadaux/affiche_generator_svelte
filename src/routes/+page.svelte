<script>
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.ts';
	import ContainerAffiche from '../lib/layout/ContainerAffiche.svelte';
	import Generator from '#lib/layout/Generator.svelte';

	const optionsLibrary = [
		{ id: 1, label: 'Les Allées', text: 'Les Allées' },
		{ id: 2, label: 'André Labarrère', text: 'André Labarrère' },
		{ id: 3, label: "Trait d'Union", text: "Trait d'Union" },
		{ id: 4, label: 'Lons', text: 'de Lons' },
		{ id: 5, label: 'Billère', text: 'de Billère' },
		{ id: 6, label: 'Jurançon', text: 'de Jurançon' },
		{ id: 7, label: 'Lescar', text: 'de Lescar' },
		{ id: 8, label: 'Gan', text: 'de Gan' },
		{ id: 9, label: 'Espaci Lectura', text: 'Espaci Lectura' }
	];

	let selectedLibrary = $state();

	const optionsMonth = [
		{ id: 1, label: 'Janvier', text: 'de Janvier' },
		{ id: 2, label: 'Février', text: 'de Février' },
		{ id: 3, label: 'Mars', text: 'de Mars' },
		{ id: 4, label: 'Avril', text: "d'Avril" },
		{ id: 5, label: 'Mai', text: 'de Mai' },
		{ id: 6, label: 'Juin', text: 'de Juin' },
		{ id: 7, label: 'Juillet', text: 'de Juillet' },
		{ id: 8, label: 'Août', text: "d'Août" },
		{ id: 9, label: 'Septembre', text: 'de Septembre' },
		{ id: 10, label: 'Octobre', text: "d'Octobre" },
		{ id: 11, label: 'Novembre', text: 'de Novembre' },
		{ id: 12, label: 'Décembre', text: 'de Décembre' }
	];

	let selectedMonth = $state();

	let styles = $state({
		bgDate: '#00FF00',
		bgTitle: '#FF0000',
		colorDate: '#FFFFFF',
		colorTitle: '#FFFFFF',
		colorContent: '#0000FF',
		zoom: '40%'
	});

	let pages = $state([
		{
			id: Date.now(),
			events: [
				{
					id: 1,
					title: 'banana',
					date: 'Sa. 31 oct.',
					hour: '10h',
					content: 'Me gusta banana'
				}
			]
		}
	]);

	let nbPages = $derived(pages.length);

	function addPage() {
		pages = [
			...pages,
			{
				id: Date.now(),
				events: [
					{
						id: 1,
						title: 'banana',
						date: 'Sa. 31 oct.',
						hour: '10h',
						content: 'Me gusta banana'
					}
				]
			}
		];
	}
</script>

<Generator
	{nbPages}
	{addPage}
	{optionsLibrary}
	{optionsMonth}
	bind:selectedLibrary
	bind:selectedMonth
	bind:styles
/>

<div class="container">
	{#each pages as page, i (page.id)}
		<ContainerAffiche pageNumber={i + 1} {selectedLibrary} {selectedMonth} {page} {styles} />
	{/each}
</div>

<!-- <div class="renderer" bind:this={target}>
		{#each pages as page (page.id)}
			<PageAffiche {selectedLibrary} {selectedMonth} {page} {styles} />
		{/each}
	</div> -->

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
		max-height: calc(100% - 60px);
		position: absolute;
		top: 10px;
		left: 350px;
	}
</style>
