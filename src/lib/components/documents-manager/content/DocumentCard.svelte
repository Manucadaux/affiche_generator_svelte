<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */

	import { FileText } from 'lucide-svelte';

	/** @type {{
		document: AppDocument,
		libraryName: string | null,
		monthName: string | null,
		onOpen: () => void
	}} */
	let { document, libraryName, monthName, onOpen } = $props();

	const formattedDate = $derived(
		new Date(document.updatedAt).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		})
	);
</script>

<button
	type="button"
	class="flex h-72.5 w-55 cursor-pointer flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100 text-left shadow-sm transition hover:shadow-md"
	onclick={onOpen}
	aria-label={`Ouvrir le document ${document.name}`}
>
	<div class="flex flex-1 items-center justify-center bg-base-200" aria-label="Aperçu du document">
		<FileText size={48} strokeWidth={1} class="text-base-content/30" />
	</div>

	<div class="w-full space-y-1 p-3">
		<h3 class="truncate font-semibold" title={document.name}>
			{document.name}
		</h3>

		{#if libraryName}
			<p class="truncate text-xs text-base-content/70" title={libraryName}>
				{libraryName}
			</p>
		{/if}

		{#if monthName}
			<p class="text-xs text-base-content/70">
				{monthName}
			</p>
		{/if}

		<p class="pt-1 text-xs text-base-content/50">
			Modifié le {formattedDate}
		</p>
	</div>
</button>
