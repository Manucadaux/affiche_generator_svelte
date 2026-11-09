<script>
	import Event from './Event.svelte';
	let { selectedLibrary, selectedMonth, page, styles } = $props();
</script>

<div class="page" style:zoom={styles.zoom}>
	<h2>Médiathèque {selectedLibrary && selectedLibrary.text}</h2>
	<h3>Mois {selectedMonth && selectedMonth.text}</h3>

	{#each page.events as event (event.id)}
		<Event {event} {styles} nbEvents={page.events.length} reverse={page.reverse ?? false} />
	{/each}
</div>

<style>
	.page {
		width: 297mm;
		height: 420mm;
		background: white;
		margin: 0 auto;
		color: black;
	}
</style>
