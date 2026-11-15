<script>
	import { House, X } from 'lucide-svelte';

	let { documents = [], currentDocumentId, onNavigateHome, onNavigate, onClose } = $props();
</script>

<aside class="generatorMenu">
	<div class="menuHeader">
		<h2>Navigation</h2>

		<button class="menuCloseBtn" onclick={onClose} aria-label="Fermer le menu">
			<X size={20} />
		</button>
	</div>

	<button class="menuItem" onclick={onNavigateHome}>
		<House size={18} />
		<span>Mes documents</span>
	</button>

	<div class="menuDivider"></div>

	<h3>Mes documents</h3>

	{#if documents.length > 0}
		<nav aria-label="Liste des documents">
			<ul class="documentList">
				{#each documents as document (document.id)}
					<li>
						<button
							class="menuItem documentItem"
							class:active={document.id === currentDocumentId}
							disabled={document.id === currentDocumentId}
							onclick={() => onNavigate(document.id)}
							title={document.name}
						>
							<span class="documentName">{document.name}</span>
							{#if document.id === currentDocumentId}
								<span class="currentLabel">Actuel</span>
							{/if}
						</button>
					</li>
				{/each}
			</ul>
		</nav>
	{:else}
		<p class="emptyMessage">Aucun document disponible.</p>
	{/if}
</aside>

<style>
	.generatorMenu {
		position: absolute;
		top: 65px;
		left: 0;
		z-index: 50;
		width: 270px;
		max-height: calc(100% - 65px);
		overflow-y: auto;
		padding: 16px;
		border: 1px solid var(--color-base-300);
		border-radius: 0 0 12px 0;
		background: var(--color-base-100);
		box-shadow: 4px 4px 16px rgb(0 0 0 / 12%);
	}

	.menuHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.menuHeader h2 {
		font-size: 17px;
		font-weight: 600;
	}

	.menuCloseBtn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		cursor: pointer;
	}

	.menuCloseBtn:hover,
	.menuItem:hover:not(:disabled) {
		background: var(--color-base-200);
	}

	.menuItem {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px;
		border-radius: 8px;
		text-align: left;
		cursor: pointer;
	}

	.menuDivider {
		height: 1px;
		margin: 14px 0;
		background: var(--color-base-300);
	}

	.generatorMenu h3 {
		margin-bottom: 8px;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-base-content);
		opacity: 0.65;
	}

	.documentList {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 0;
		margin: 0;
		list-style: none;
	}

	.documentItem {
		justify-content: space-between;
	}

	.documentItem:disabled {
		cursor: default;
		opacity: 1;
	}

	.documentItem.active {
		background: var(--color-base-200);
		font-weight: 600;
	}

	.documentName {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.currentLabel {
		flex-shrink: 0;
		font-size: 11px;
		font-weight: 400;
		opacity: 0.6;
	}

	.emptyMessage {
		padding: 8px 10px;
		font-size: 13px;
		opacity: 0.6;
	}
</style>
