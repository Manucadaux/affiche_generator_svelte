<script>
	import { onMount } from 'svelte';
	import { X } from 'lucide-svelte';

	/** @type {{
		message: string,
		type: 'success' | 'error' | 'info' | 'warning',
		duration?: number,
		onClose: () => void
	}} */
	let { message, type, duration = 4000, onClose } = $props();

	const alertClasses = {
		success: 'alert-success',
		error: 'alert-error',
		info: 'alert-info',
		warning: 'alert-warning'
	};

	onMount(() => {
		const timeoutId = window.setTimeout(onClose, duration);

		return () => window.clearTimeout(timeoutId);
	});
</script>

<div class="toast toast-center toast-bottom z-50">
	<div role="alert" class="alert {alertClasses[type]} shadow-lg">
		<span>{message}</span>

		<button
			type="button"
			class="btn btn-circle btn-ghost text-current btn-sm"
			aria-label="Fermer la notification"
			onclick={onClose}
		>
			<X size={18} />
		</button>
	</div>
</div>
