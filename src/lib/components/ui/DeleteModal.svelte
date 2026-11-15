<script>
	import Modal from './Modal.svelte';

	/** @type {{
		title: string,
		itemName: string,
		message?: string,
		onClose: () => void,
		onConfirm: () => void | Promise<void>
	}} */
	let { title, itemName, message, onClose, onConfirm } = $props();
</script>

<Modal {title} {onClose} size="md">
	<p class="text-sm">
		Êtes-vous sûr de vouloir supprimer « <strong>{itemName}</strong> » ?
	</p>

	{#if message}
		<p class="mt-2 text-sm text-base-content/60">{message}</p>
	{/if}

	<div class="mt-6 flex flex-col gap-2">
		<button type="button" class="btn btn-error" onclick={onConfirm}> Supprimer </button>

		<button type="button" class="btn btn-ghost" onclick={onClose}> Annuler </button>
	</div>
</Modal>
