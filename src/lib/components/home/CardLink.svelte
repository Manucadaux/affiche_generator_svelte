<script>
	let { title, description, href } = $props();
</script>

<a
	// eslint-disable-next-line svelte/no-navigation-without-resolve
	{href}
	class="card cursor-pointer border border-base-300 bg-base-100 p-6 text-left shadow-sm transition hover:border-primary hover:shadow-md"
>
	<h2 class="text-xl font-semibold">{title}</h2>
	<p class="mt-2 text-base-content/60">
		{description}
	</p>
</a>
