<script>
	let { pageNumber, page, canDelete, onDeletePage, onAddEvent, onRemoveEvent } = $props();
</script>

<div class="headerPageContainer bg-base-300">
	<div>
		<p>Page n° {pageNumber}</p>

		<p>
			Nombre d'évènements :
			<button
				class="btn btn-sm"
				disabled={page.events.length <= 1}
				onclick={() => onRemoveEvent(page.id)}
			>
				-
			</button>

			{page.events.length}

			<button
				class="btn btn-sm"
				disabled={page.events.length >= 4}
				onclick={() => onAddEvent(page.id)}
			>
				+
			</button>
		</p>
	</div>

	<button class="btn btn-sm" disabled={!canDelete} onclick={() => onDeletePage(page.id)}>
		Supprimer la page
	</button>
</div>

<style>
	.headerPageContainer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px;
		border: 1px solid black;
		border-bottom: none;
		border-radius: 16px 16px 0 0;
		width: 100%;
		box-sizing: border-box;
	}
</style>
