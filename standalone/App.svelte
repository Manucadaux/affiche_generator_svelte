<script>
	import HomeView from '../src/lib/components/views/HomeView.svelte';
	import EventsManagerView from '../src/lib/components/views/EventsManagerView.svelte';
	import DocumentsManagerView from '../src/lib/components/views/DocumentsManagerView.svelte';
	import DocumentEditorView from '../src/lib/components/views/DocumentEditorView.svelte';
	import RenderView from '../src/lib/components/views/RenderView.svelte';

	function getCurrentRoute() {
		const [route, query = ''] = window.location.hash.slice(1).split('?');
		const params = new URLSearchParams(query);

		return {
			view: route || 'home',
			documentId: params.get('documentId')
		};
	}

	const initialRoute = getCurrentRoute();

	let currentView = $state(initialRoute.view);
	let currentDocumentId = $state(initialRoute.documentId);

	function updateView() {
		const route = getCurrentRoute();

		currentView = route.view;
		currentDocumentId = route.documentId;
	}

	function onFinish() {
		const query = new URLSearchParams({
			documentId: currentDocumentId ?? ''
		});

		window.location.hash = `document-editor?${query.toString()}`;
	}
</script>

<svelte:window onhashchange={updateView} />

{#if currentView === 'events-manager'}
	<EventsManagerView />
{:else if currentView === 'documents-manager'}
	<DocumentsManagerView />
{:else if currentView === 'document-editor' && currentDocumentId}
	<DocumentEditorView documentId={currentDocumentId} standalone={true} />
{:else if currentView === 'render'}
	<RenderView documentId={currentDocumentId} {onFinish} />
{:else}
	<HomeView />
{/if}
