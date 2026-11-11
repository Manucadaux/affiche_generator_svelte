export function generateId() {
	return crypto.randomUUID();
}

export function createEvent() {
	return {
		id: generateId(),
		title: 'banana',
		sizeTitle: 36,
		date: 'Sa. 31 oct.',
		hour: '10h',
		content: 'Me gusta banana',
		sizeDescription: 25,
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
