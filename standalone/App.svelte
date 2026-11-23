<script>
	import HomeView from '../src/lib/components/views/HomeView.svelte';
	import EventsManagerView from '../src/lib/components/views/EventsManagerView.svelte';
	import DocumentsManagerView from '../src/lib/components/views/DocumentsManagerView.svelte';
	import RenderView from '../src/lib/components/views/RenderView.svelte';

	function getCurrentView() {
		const hash = window.location.hash;

		if (hash === '#events-manager') return 'events';
		if (hash === '#documents-manager') return 'documents';
		if (hash === '#render') return 'render';

		return 'home';
	}

	let currentView = $state(getCurrentView());

	function updateView() {
		currentView = getCurrentView();
	}

	function onFinish() {
		window.location.hash = 'home';
	}
</script>

<svelte:window onhashchange={updateView} />

{#if currentView === 'events'}
	<EventsManagerView />
{:else if currentView === 'documents'}
	<DocumentsManagerView />
{:else if currentView === 'render'}
	<RenderView {onFinish} />
{:else}
	<HomeView />
{/if}
