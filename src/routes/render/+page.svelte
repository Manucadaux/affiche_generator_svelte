<script>
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import RenderView from '#lib/components/views/RenderView.svelte';

	function onFinish() {
		goto(resolve('/'));
	}
</script>

<RenderView {onFinish} />
