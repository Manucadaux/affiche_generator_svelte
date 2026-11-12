<script>
	import HomeView from '../src/lib/components/views/HomeView.svelte';
	import RenderView from '../src/lib/components/views/RenderView.svelte';

	let currentView = $state(window.location.hash === '#render' ? 'render' : 'home');

	function updateView() {
		currentView = window.location.hash === '#render' ? 'render' : 'home';
	}

	function onFinish() {
		window.location.hash = '';
	}
</script>

<svelte:window onhashchange={updateView} />

{#if currentView === 'render'}
	<RenderView {onFinish} />
{:else}
	<HomeView renderHref="#render" />
{/if}
