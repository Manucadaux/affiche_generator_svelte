<script>
	import { onMount } from 'svelte';
	import { X } from 'lucide-svelte';

	/** @type {{
		title: string,
		onClose: () => void,
		size?: 'sm' | 'md' | 'lg' | 'xl',
		children: import('svelte').Snippet
	}} */
	let { title, onClose, size = 'md', children } = $props();

	/** @type {HTMLDialogElement} */
	let dialogElement;

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl'
	};

	onMount(() => {
		dialogElement.showModal();
	});

	/**
	 * Ferme la modale si le clic est effectué sur l'arrière-plan.
	 * @param {MouseEvent} event
	 * @returns {void}
	 */
	function handleBackdropClick(event) {
		if (event.target === dialogElement) {
			dialogElement.close();
		}
	}
</script>

<dialog bind:this={dialogElement} class="modal" onclose={onClose} onclick={handleBackdropClick}>
	<div class="relative modal-box w-full {sizeClasses[size]}">
		<header class="mb-6 flex items-center justify-between">
			<h2 class="pr-4 text-xl font-semibold">{title}</h2>

			<button
				type="button"
				class="btn btn-square btn-ghost btn-sm"
				aria-label="Fermer"
				onclick={() => dialogElement.close()}
			>
				<X size={20} />
			</button>
		</header>

		{@render children()}
	</div>
</dialog>
