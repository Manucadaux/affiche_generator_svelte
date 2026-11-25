import { optionsLibrary } from '#lib/data/options.js';

/**
 * Échappe les caractères spéciaux pour une insertion HTML sécurisée.
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}

/**
 * Formate une date au format français.
 * @param {string | null} dateString
 * @returns {string}
 */
function formatDate(dateString) {
	if (!dateString) return '';

	const [year, month, day] = dateString.split('-');
	const date = new Date(Number(year), Number(month) - 1, Number(day));

	return new Intl.DateTimeFormat('fr-FR').format(date);
}

/**
 * Prépare les contenus texte et HTML d'un événement.
 * @param {import('#lib/utils/types.js').ManagedEvent} event
 * @returns {{ text: string, html: string }}
 */
export function formatEventForClipboard(event) {
	/** @type {{ label: string, value: string }[]} */
	const fields = [];

	/**
	 * Ajoute une information si elle est renseignée.
	 * @param {string} label
	 * @param {string | null | undefined} value
	 */
	function addField(label, value) {
		const normalizedValue = value?.trim();

		if (normalizedValue) {
			fields.push({ label, value: normalizedValue });
		}
	}

	addField('Événement', event.title);

	if (event.libraryId !== null) {
		const libraryName =
			optionsLibrary.find((library) => library.id === event.libraryId)?.label ?? '';

		addField('Médiathèque', libraryName);
	}

	addField('Section', event.section);
	addField('Public concerné', event.condition);
	addField('Lieu', event.location);

	if (event.startDate) {
		addField('Date de début', formatDate(event.startDate));
	}

	if (event.endDate) {
		addField('Date de fin', formatDate(event.endDate));
	}

	const timeSlots = event.timeSlots
		.map((slot) => {
			if (slot.start && slot.end) return `${slot.start} – ${slot.end}`;
			return slot.start || slot.end;
		})
		.filter(Boolean)
		.join(', ');

	addField('Horaires', timeSlots);

	// La valeur booléenne est toujours significative.
	fields.push({
		label: 'Inscription',
		value: event.inscription ? 'Avec inscription' : 'Sans inscription'
	});

	addField('Temps fort lié', event.highlight);
	addField('Genre', event.genre);
	addField("Type d'action", event.actionType);
	addField('Prestataires', event.providers);
	addField('Partenaire', event.partner);
	addField('Montant', event.amount);

	addField('Description générale', event.description);
	addField("Description pour l'affiche", event.posterDescription);
	addField('Description pour le livret', event.bookletDescription);
	addField("Description pour l'agenda en ligne", event.onlineDescription);
	addField('Commentaire', event.comment);

	const text = fields.map(({ label, value }) => `${label} : ${value}`).join('\n\n');

	const html = `
		<section>
			<h2>${escapeHtml(event.title || 'Événement sans titre')}</h2>
			${fields
				.filter((field) => field.label !== 'Événement')
				.map(
					({ label, value }) => `
						<p>
							<strong>${escapeHtml(label)} :</strong>
							${escapeHtml(value).replaceAll('\n', '<br>')}
						</p>
					`
				)
				.join('')}
		</section>
	`;

	return { text, html };
}

/**
 * Prépare les contenus texte et HTML de plusieurs événements.
 * @param {import('#lib/utils/types.js').ManagedEvent[]} events
 * @returns {{ text: string, html: string }}
 */
export function formatEventsForClipboard(events) {
	const formattedEvents = events.map(formatEventForClipboard);

	return {
		text: formattedEvents
			.map((event) => event.text)
			.join('\n\n----------------------------------------\n\n'),
		html: formattedEvents.map((event) => event.html).join('<hr>')
	};
}

/**
 * Copie un ou plusieurs événements dans le presse-papiers.
 * @param {import('#lib/utils/types.js').ManagedEvent[]} events
 * @returns {Promise<void>}
 */
export async function copyEventsToClipboard(events) {
	if (events.length === 0) {
		throw new Error('Aucun événement à copier.');
	}

	const { text } = formatEventsForClipboard(events);

	if (!navigator.clipboard?.writeText) {
		throw new Error('La copie dans le presse-papiers est indisponible.');
	}

	await navigator.clipboard.writeText(text);
}
