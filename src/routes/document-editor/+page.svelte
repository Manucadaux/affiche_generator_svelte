<script>
	import { page } from '$app/state';
	import DocumentEditorView from '#lib/components/views/DocumentEditorView.svelte';

	let documentId = $derived(page.url.searchParams.get('documentId'));
</script>

<DocumentEditorView {documentId} />
