<script>
	import { Search, ArrowDownWideNarrow } from 'lucide-svelte';

	let { searchQuery = $bindable(''), sortOrder = $bindable('updated-desc') } = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h2 class="text-xl font-semibold">Mes documents</h2>

	<div class="flex flex-wrap items-center gap-3">
		<label class="input-bordered input flex items-center gap-2 input-sm">
			<Search size={16} class="text-base-content/50" />

			<input
				type="search"
				class="grow"
				placeholder="Rechercher un document"
				aria-label="Rechercher un document"
				bind:value={searchQuery}
			/>
		</label>

		<label class="flex items-center gap-2">
			<ArrowDownWideNarrow size={16} class="text-base-content/50" />

			<select
				class="select-bordered select select-sm"
				aria-label="Trier les documents"
				bind:value={sortOrder}
			>
				<option value="updated-desc">Modifiés récemment</option>
				<option value="updated-asc">Modifiés anciennement</option>
				<option value="name-asc">Nom (A à Z)</option>
				<option value="name-desc">Nom (Z à A)</option>
			</select>
		</label>
	</div>
</div>
