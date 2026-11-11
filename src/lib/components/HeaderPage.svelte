<script>
	let { pageNumber, page, canDelete, onDeletePage, onAddEvent, onRemoveEvent, onToggleReverse } =
		$props();
</script>

<div class="headerPageContainer bg-base-300">
	<div>
		<p>
			Page n° {pageNumber}
			<label class="label">
				<input
					type="checkbox"
					class="checkbox checkbox-xs"
					checked={page.reverse ?? false}
					onchange={(event) => onToggleReverse(page.id, event.currentTarget.checked)}
				/>
				Inversé
			</label>
		</p>

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
	<div>
		<button class="btn btn-sm" disabled={!canDelete} onclick={() => onDeletePage(page.id)}>
			Supprimer la page
		</button>
	</div>
</div>

<style>
	.headerPageContainer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px;
		width: 100%;
		box-sizing: border-box;
	}

	label {
		margin-left: 20px;
	}
</style>
