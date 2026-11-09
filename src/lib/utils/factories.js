export function generateId() {
	return crypto.randomUUID();
}

export function createEvent() {
	return {
		id: generateId(),
		title: 'banana',
		date: 'Sa. 31 oct.',
		hour: '10h',
		content: 'Me gusta banana'
	};
}

export function createPage() {
	return {
		id: generateId(),
		events: [createEvent()]
	};
}
