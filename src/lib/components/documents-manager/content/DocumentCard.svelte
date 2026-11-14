<script>
	/** @typedef {import('#lib/utils/types.js').AppDocument} AppDocument */
	import { autoPlacement, autoUpdate, computePosition, shift } from '@floating-ui/dom';

	import { onMount } from 'svelte';
	import { FileText, EllipsisVertical } from 'lucide-svelte';

	/** @type {{
		document: AppDocument,
		libraryName: string | null,
		monthName: string | null,
		onOpen: () => void
	}} */
	let { document, libraryName, monthName, onOpen } = $props();

	let isMenuOpen = $state(false);
	/** @type {HTMLButtonElement | undefined} */
	let menuButton = $state();

	/** @type {HTMLDivElement | undefined} */
	let menuElement = $state();

	let menuStyle = $state('left: 0; top: 0; visibility: hidden;');

	$effect(() => {
		if (!isMenuOpen || !menuButton || !menuElement) return;

		// Point de référence : coin inférieur droit du bouton.
		const reference = {
			contextElement: menuButton,

			getBoundingClientRect() {
				const rect = menuButton.getBoundingClientRect();

				return {
					x: rect.right,
					y: rect.bottom,
					top: rect.bottom,
					right: rect.right,
					bottom: rect.bottom,
					left: rect.right,
					width: 0,
					height: 0
				};
			}
		};

		let isActive = true;

		/**
		 * Calcule et actualise la position du menu.
		 * @returns {void}
		 */
		function updatePosition() {
			computePosition(reference, menuElement, {
				strategy: 'fixed',
				placement: 'bottom-start',
				middleware: [
					autoPlacement({
						allowedPlacements: ['bottom-start', 'bottom-end', 'top-start', 'top-end'],
						padding: 8
					}),
					shift({ padding: 8 })
				]
			}).then(({ x, y }) => {
				if (!isActive) return;

				menuStyle = `left: ${x}px; top: ${y}px; visibility: visible;`;
			});
		}

		const cleanup = autoUpdate(reference, menuElement, updatePosition);

		return () => {
			isActive = false;
			cleanup();
		};
	});

	const formattedDate = $derived(
		new Date(document.updatedAt).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		})
	);

	onMount(() => {
		/**
		 * Ferme le menu si le clic est effectué à l'extérieur.
		 * @param {PointerEvent} event
		 */
		function handleOutsideClick(event) {
			const target = event.target;

			if (
				target instanceof Node &&
				!menuElement?.contains(target) &&
				!menuButton?.contains(target)
			) {
				isMenuOpen = false;
			}
		}

		/**
		 * Ferme le menu avec Échap.
		 * @param {KeyboardEvent} event
		 */
		function handleKeydown(event) {
			if (event.key === 'Escape') {
				isMenuOpen = false;
			}
		}

		window.document.addEventListener('pointerdown', handleOutsideClick);
		window.document.addEventListener('keydown', handleKeydown);

		return () => {
			window.document.removeEventListener('pointerdown', handleOutsideClick);
			window.document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="group relative h-72.5 w-55">
	<button
		type="button"
		class="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100 text-left shadow-sm transition hover:shadow-md"
		onclick={onOpen}
		aria-label={`Ouvrir le document ${document.name}`}
	>
		<div
			class="flex flex-1 items-center justify-center bg-base-200"
			aria-label="Aperçu du document"
		>
			<FileText size={48} strokeWidth={1} class="text-base-content/30" />
		</div>

		<div class="w-full space-y-1 px-3 pt-3 pb-5">
			<div class="flex h-6 items-center">
				<h3 class="truncate font-semibold" title={document.name}>
					{document.name}
				</h3>
			</div>

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

	<div class="absolute right-2 bottom-2 z-10">
		<button
			bind:this={menuButton}
			type="button"
			class="flex size-8 cursor-pointer items-center justify-center rounded-full border border-base-300 bg-base-100 text-base-content/60 transition hover:border-base-content/30 hover:bg-base-200 hover:text-base-content"
			aria-label={`Actions du document ${document.name}`}
			aria-expanded={isMenuOpen}
			aria-haspopup="true"
			onclick={() => (isMenuOpen = !isMenuOpen)}
		>
			<EllipsisVertical size={18} />
		</button>

		{#if isMenuOpen}
			<div
				bind:this={menuElement}
				style={menuStyle}
				class="fixed z-50 min-w-40 rounded-lg border border-base-300 bg-base-100 p-1 shadow-lg"
			>
				<!-- Les actions seront branchées à l'étape suivante. -->
				<div class="px-3 py-2 text-sm">Dupliquer</div>
				<div class="px-3 py-2 text-sm">Supprimer</div>
			</div>
		{/if}
	</div>
</div>
