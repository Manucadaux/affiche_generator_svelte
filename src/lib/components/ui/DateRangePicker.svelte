<script>
	import { onMount } from 'svelte';

	import flatpickr from 'flatpickr';
	import rangePlugin from 'flatpickr/dist/plugins/rangePlugin.js';
	import { French } from 'flatpickr/dist/l10n/fr.js';

	import 'flatpickr/dist/flatpickr.css';

	let {
		startDate = $bindable(null),
		endDate = $bindable(null),
		idPrefix = 'date-range'
	} = $props();

	/** @type {HTMLInputElement} */
	let startInput;

	/** @type {HTMLInputElement} */
	let endInput;

	/** @type {Exclude<ReturnType<typeof flatpickr>, any[]> | null} */
	let picker = null;

	/**
	 * Convertit une date ISO en objet Date local.
	 * @param {string | null} value
	 * @returns {Date | null}
	 */
	function toDate(value) {
		if (!value) return null;

		const [year, month, day] = value.split('-').map(Number);

		return new Date(year, month - 1, day);
	}

	/**
	 * Convertit une date en chaîne ISO sans décalage horaire.
	 * @param {Date | null} date
	 * @returns {string | null}
	 */
	function toIso(date) {
		if (!date) return null;

		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');

		return `${year}-${month}-${day}`;
	}

	onMount(() => {
		const modalElement = startInput.closest('dialog');

		if (!modalElement) {
			throw new Error('La modale contenant le calendrier est introuvable.');
		}

		picker = flatpickr(startInput, {
			locale: French,
			mode: 'range',
			dateFormat: 'd/m/Y',
			allowInput: true,
			disableMobile: true,
			appendTo: modalElement,

			defaultDate: /** @type {Date[]} */ (
				[toDate(startDate), toDate(endDate)].filter(
					/** @param {Date | null} date */
					(date) => date !== null
				)
			),

			plugins: [
				rangePlugin({
					input: endInput
				})
			],

			onChange(selectedDates) {
				startDate = toIso(selectedDates[0] ?? null);
				endDate = selectedDates.length > 1 ? toIso(selectedDates[1]) : null;
			},

			onClose(selectedDates) {
				// Une seule date sélectionnée correspond à un événement sur une journée.
				if (selectedDates.length === 1) {
					endDate = null;
				}
			}
		});

		return () => picker?.destroy();
	});

	// Synchronise le calendrier si les dates changent depuis le composant parent.
	$effect(() => {
		const currentStart = startDate;
		const currentEnd = endDate;

		if (!picker) return;

		const dates = /** @type {Date[]} */ (
			[toDate(currentStart), toDate(currentEnd)].filter(
				/** @param {Date | null} date */
				(date) => date !== null
			)
		);

		const currentSelection = picker.selectedDates.map(toIso);
		const nextSelection = dates.map(toIso);

		if (JSON.stringify(currentSelection) !== JSON.stringify(nextSelection)) {
			picker.setDate(dates, false);
		}
	});
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
	<div class="form-control">
		<label class="label" for="{idPrefix}-start">
			<span class="label-text">Date de début</span>
		</label>

		<input
			bind:this={startInput}
			id="{idPrefix}-start"
			type="text"
			class="input-bordered input w-full"
			placeholder="JJ/MM/AAAA"
			autocomplete="off"
		/>
	</div>

	<div class="form-control">
		<label class="label" for="{idPrefix}-end">
			<span class="label-text">Date de fin (facultative)</span>
		</label>

		<input
			bind:this={endInput}
			id="{idPrefix}-end"
			type="text"
			class="input-bordered input w-full"
			placeholder="JJ/MM/AAAA"
			autocomplete="off"
		/>
	</div>
</div>
