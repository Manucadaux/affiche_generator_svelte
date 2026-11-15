<script>
	import { PencilLine } from 'lucide-svelte';

	let { nbPages, documentName = $bindable(), onAddPage, onDeleteLastPage, renderHref } = $props();
</script>

<div class="documentOptions">
	<div class="documentName">
		<label for="documentName">Nom du document</label>
		<div class="inputContainer">
			<input
				id="documentName"
				type="text"
				class="input-bordered input w-full text-base input-md"
				bind:value={documentName}
			/>
			<PencilLine size={15} class="pencilIcon" />
		</div>
	</div>

	<div class="pageOptions">
		<span>Nombre de pages :</span>

		<div class="eventCounter">
			<button
				class="eventCounterBtn"
				disabled={nbPages <= 1}
				onclick={onDeleteLastPage}
				aria-label="Supprimer la dernière page"
			>
				−
			</button>

			<span class="eventCounterValue">{nbPages}</span>

			<button class="eventCounterBtn" onclick={onAddPage} aria-label="Ajouter une page"> + </button>
		</div>
	</div>

	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a href={renderHref} class="btn btn-block btn-primary"> Générer le PDF </a>
</div>

<style>
	.documentOptions > div {
		margin: 25px 0;
	}

	.inputContainer {
		position: relative;
	}

	:global(.pencilIcon) {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		opacity: 0.6;
	}

	.pageOptions {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.eventCounter {
		display: inline-flex;
		align-items: center;
		border: 1px solid;
		border-color: color-mix(in oklch, var(--color-base-content) 50%, transparent);
		border-radius: 999px;
		padding: 2px 5px;
		gap: 4px;
	}

	.eventCounterBtn {
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		font-size: 18px;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.eventCounterBtn:hover:not(:disabled) {
		background-color: hsl(var(--bc) / 0.1);
	}

	.eventCounterBtn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.eventCounterValue {
		width: 35px;
		text-align: center;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		border-left: 1px solid color-mix(in oklch, var(--color-base-content) 50%, transparent);
		border-right: 1px solid color-mix(in oklch, var(--color-base-content) 50%, transparent);
	}
</style>
