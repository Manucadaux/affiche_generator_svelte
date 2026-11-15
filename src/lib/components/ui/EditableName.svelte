<script>
	import { tick } from 'svelte';
	import { PencilLine } from 'lucide-svelte';

	/**
	 * @typedef {{
	 *   value: string,
	 *   size?: 'card' | 'editor',
	 *   label?: string,
	 *   onSave?: (name: string) => boolean | Promise<boolean>
	 * }} Props
	 */

	/** @type {Props} */
	let { value = $bindable(), size = 'card', label = 'Nom', onSave } = $props();

	let isEditing = $state(false);
	let isSaving = $state(false);
	let nameDraft = $state('');

	/** @type {HTMLInputElement | undefined} */
	let nameInput = $state();

	/**
	 * Active le mode édition et sélectionne le nom.
	 * @returns {Promise<void>}
	 */
	async function handleStartEditing() {
		nameDraft = value;
		isEditing = true;

		await tick();

		nameInput?.focus();
		nameInput?.select();
	}

	/**
	 * Annule la modification.
	 * @returns {void}
	 */
	function handleCancelEditing() {
		nameDraft = value;
		isEditing = false;
	}

	/**
	 * Valide et enregistre le nouveau nom.
	 * @returns {Promise<void>}
	 */
	async function handleFinishEditing() {
		if (!isEditing || isSaving) return;

		const name = nameDraft.trim();

		if (!name) {
			handleCancelEditing();
			return;
		}

		if (name === value) {
			isEditing = false;
			return;
		}

		isSaving = true;

		try {
			if (onSave) {
				const success = await onSave(name);
				if (success) isEditing = false;
			} else {
				value = name;
				isEditing = false;
			}
		} finally {
			isSaving = false;
		}
	}

	/**
	 * Gère les raccourcis clavier du champ.
	 * @param {KeyboardEvent} event
	 * @returns {void}
	 */
	function handleKeydown(event) {
		event.stopPropagation();

		if (event.key === 'Enter') {
			event.preventDefault();
			handleFinishEditing();
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			handleCancelEditing();
		}
	}
</script>

<div class="flex w-full min-w-0 items-center gap-2">
	{#if isEditing}
		<input
			bind:this={nameInput}
			type="text"
			bind:value={nameDraft}
			disabled={isSaving}
			class="input-bordered input h-8 min-w-0 flex-1"
			class:text-sm={size === 'card'}
			class:text-base={size === 'editor'}
			aria-label={label}
			onkeydown={handleKeydown}
			onblur={handleFinishEditing}
			onclick={(event) => event.stopPropagation()}
		/>
	{:else}
		<button
			type="button"
			class="min-w-0 flex-1 cursor-text truncate text-left font-semibold"
			class:text-sm={size === 'card'}
			class:text-base={size === 'editor'}
			title={value}
			aria-label={`Modifier ${label.toLowerCase()}`}
			onclick={(event) => {
				event.stopPropagation();
				handleStartEditing();
			}}
		>
			{value}
		</button>

		<button
			type="button"
			class="flex-none cursor-pointer opacity-60 transition hover:opacity-100"
			aria-label={`Modifier ${label.toLowerCase()}`}
			title="Modifier"
			onclick={(event) => {
				event.stopPropagation();
				handleStartEditing();
			}}
		>
			<PencilLine size={size === 'card' ? 14 : 16} />
		</button>
	{/if}
</div>
