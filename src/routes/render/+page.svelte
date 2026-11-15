<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import RenderView from '#lib/components/views/RenderView.svelte';

	let documentId = $derived(page.url.searchParams.get('documentId'));

	function onFinish() {
		if (!documentId) {
			goto(resolve('/'));
			return;
		}

		const url = new URL(resolve('/document-editor'), page.url.origin);
		url.searchParams.set('documentId', documentId);

		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url);
	}
</script>

<RenderView {documentId} {onFinish} />
