<script>
	import { tick } from 'svelte';
	import { PencilLine } from '@lucide/svelte';

	/**
	 * @typedef {{
	 *   value: string | number,
	 *   size?: 'card' | 'editor',
	 *   label?: string,
	 *   mode?: 'toggle' | 'always',
	 *   inputType?: 'text' | 'number',
	 *   multiline?: boolean,
	 *   min?: number,
	 *   rows?: number,
	 *   inputClass?: string,
	 *   onSave?: (newValue: string) => boolean | Promise<boolean>,
	 *   onInput?: (value: string | number) => void,
	 *   onBeginEdit?: () => void,
	 *   onEndEdit?: () => void
	 * }} Props
	 */

	/** @type {Props} */
	let {
		value = $bindable(),
		size = 'card',
		label = 'Nom',
		mode = 'toggle',
		inputType = 'text',
		multiline = false,
		min,
		rows = 2,
		inputClass,
		onSave,
		onInput,
		onBeginEdit,
		onEndEdit
	} = $props();

	let isEditing = $state(false);
	let isSaving = $state(false);
	let draft = $state(value);
	let initialValue = $state(value);
	let isFocused = $state(false);

	/** @type {HTMLInputElement | HTMLTextAreaElement | undefined} */
	let fieldInput = $state();

	// Synchronise le brouillon lorsque la valeur change extérieurement.
	$effect(() => {
		if (!isFocused) {
			draft = value;
		}
	});

	/**
	 * Active le mode édition et sélectionne le nom.
	 * @returns {Promise<void>}
	 */
	async function handleStartEdit() {
		draft = value;
		isEditing = true;

		await tick();

		fieldInput?.focus();
		fieldInput?.select();
	}

	/**
	 * Annule la modification du nom.
	 * @returns {void}
	 */
	function handleCancelEdit() {
		draft = value;
		isEditing = false;
	}

	/**
	 * Valide et enregistre le nouveau nom.
	 * @returns {Promise<void>}
	 */
	async function handleFinishEdit() {
		if (!isEditing || isSaving) return;

		const newValue = String(draft).trim();

		if (!newValue) {
			handleCancelEdit();
			return;
		}

		if (newValue === value) {
			isEditing = false;
			return;
		}

		isSaving = true;

		try {
			if (onSave) {
				const success = await onSave(newValue);
				if (success) isEditing = false;
			} else {
				value = newValue;
				isEditing = false;
			}
		} finally {
			isSaving = false;
		}
	}

	/**
	 * Démarre une session de modification en mode permanent.
	 * @returns {void}
	 */
	function handleFocus() {
		if (mode !== 'always' || isFocused) return;

		initialValue = value;
		draft = value;
		isFocused = true;
		onBeginEdit?.();
	}

	/**
	 * Transmet la nouvelle valeur pendant la saisie.
	 * @returns {void}
	 */
	function handleInput() {
		if (mode !== 'always') return;

		const newValue = inputType === 'number' ? (draft === '' ? '' : Number(draft)) : String(draft);

		onInput?.(newValue);
	}

	/**
	 * Termine une session de modification en mode permanent.
	 * @returns {void}
	 */
	function handleBlur() {
		if (mode !== 'always' || !isFocused) return;

		isFocused = false;
		draft = value;
		onEndEdit?.();
	}

	/**
	 * Annule les modifications de la session en cours.
	 * @returns {void}
	 */
	function handleCancelAlways() {
		draft = initialValue;
		onInput?.(initialValue);
		fieldInput?.blur();
	}

	/**
	 * Gère les raccourcis clavier du champ.
	 * @param {KeyboardEvent} event
	 * @returns {void}
	 */
	function handleKeydown(event) {
		event.stopPropagation();

		if (event.key === 'Escape') {
			event.preventDefault();

			if (mode === 'always') {
				handleCancelAlways();
			} else {
				handleCancelEdit();
			}

			return;
		}

		if (event.key === 'Enter') {
			if (multiline && event.shiftKey) return;

			event.preventDefault();

			if (mode === 'always') {
				fieldInput?.blur();
			} else {
				handleFinishEdit();
			}
		}
	}
</script>

{#if mode === 'always'}
	{#if multiline}
		<textarea
			bind:this={fieldInput}
			bind:value={draft}
			{rows}
			class={inputClass || 'textarea-bordered textarea w-full'}
			aria-label={label}
			onfocus={handleFocus}
			oninput={handleInput}
			onblur={handleBlur}
			onkeydown={handleKeydown}></textarea>
	{:else}
		<input
			bind:this={fieldInput}
			type={inputType}
			bind:value={draft}
			min={inputType === 'number' ? min : undefined}
			class={inputClass || 'input-bordered input h-8 w-full'}
			aria-label={label}
			onfocus={handleFocus}
			oninput={handleInput}
			onblur={handleBlur}
			onkeydown={handleKeydown}
		/>
	{/if}
{:else}
	<div class="flex w-full min-w-0 items-center gap-2">
		{#if isEditing}
			<input
				bind:this={fieldInput}
				type="text"
				bind:value={draft}
				disabled={isSaving}
				class="input-bordered input h-8 min-w-0 flex-1"
				class:text-sm={size === 'card'}
				class:text-base={size === 'editor'}
				aria-label={label}
				onkeydown={handleKeydown}
				onblur={handleFinishEdit}
				onclick={(event) => event.stopPropagation()}
			/>
		{:else}
			<button
				type="button"
				class="min-w-0 flex-1 cursor-text truncate text-left font-semibold"
				class:text-sm={size === 'card'}
				class:text-base={size === 'editor'}
				title={String(value)}
				aria-label={`Modifier ${label.toLowerCase()}`}
				onclick={(event) => {
					event.stopPropagation();
					handleStartEdit();
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
					handleStartEdit();
				}}
			>
				<PencilLine size={size === 'card' ? 14 : 16} />
			</button>
		{/if}
	</div>
{/if}
