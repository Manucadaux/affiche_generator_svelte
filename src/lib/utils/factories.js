export function generateId() {
	return crypto.randomUUID();
}

export function createEvent() {
	return {
		id: generateId(),
		title: 'banana',
		date: 'Sa. 31 oct.',
		hour: '10h',
		content: 'Me gusta banana',
		condition: 'tout public',
		inscription: true
	};
}

export function createPage() {
	return {
		id: generateId(),
		reverse: false,
		events: [createEvent()]
	};
}
