<script>
	import Header from './affiche/Header.svelte';
	import Event from './affiche/Event.svelte';
	import Footer from './affiche/Footer.svelte';
	import Decoration from './affiche/Decoration.svelte';

	let { selectedLibrary, selectedMonth, page, styles } = $props();
</script>

<div class="page" style:zoom={styles.zoom}>
	<Decoration />

	<header class="headerPage">
		<Header {selectedLibrary} {selectedMonth} {styles} />
	</header>

	<main class="contentPage">
		{#each page.events as event, i (event.id)}
			<Event
				{event}
				{styles}
				nbEvents={page.events.length}
				reverse={page.reverse ?? false}
				eventIndex={i}
			/>
		{/each}
	</main>

	<footer class="footerPage">
		<Footer {styles} />
	</footer>
</div>

<style>
	.page {
		width: 297mm;
		height: 420mm;
		margin: 0 auto;
		background: white;
		color: black;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		font-family: 'luciole', 'Open Sans', sans-serif;
		text-align: center;
		box-sizing: border-box;
	}

	.headerPage {
		flex: 0 0 14.7%;
		width: 100%;
	}

	.contentPage {
		flex: 0 0 75.4%;
		width: 100%;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.footerPage {
		flex: 0 0 9.9%;
		width: 100%;
	}
</style>
