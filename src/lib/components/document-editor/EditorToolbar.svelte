<script>
	import { Undo2, Redo2 } from 'lucide-svelte';

	let { canUndo = false, canRedo = false, onUndo, onRedo } = $props();
</script>

<div class="editorToolbar">
	<div class="flex items-center gap-2">
		<div class="tooltip tooltip-bottom" data-tip="Annuler (Ctrl + Z)">
			<button
				class="btn btn-square btn-ghost btn-sm"
				disabled={!canUndo}
				onclick={onUndo}
				aria-label="Annuler"
			>
				<Undo2 size={20} />
			</button>
		</div>

		<div class="tooltip tooltip-bottom" data-tip="Rétablir (Ctrl + Y)">
			<button
				class="btn btn-square btn-ghost btn-sm"
				disabled={!canRedo}
				onclick={onRedo}
				aria-label="Rétablir"
			>
				<Redo2 size={20} />
			</button>
		</div>
	</div>
</div>

<style>
	.editorToolbar {
		position: fixed;
		top: 0;
		left: 310px;
		right: 0;
		z-index: 8;

		display: flex;
		align-items: center;
		justify-content: flex-start;

		min-height: 44px;
		padding: 4px 12px;
		box-sizing: border-box;

		background-color: var(--color-base-300);
		border-bottom: 1px solid var(--color-base-300);
	}
</style>
