export function generateId() {
	return crypto.randomUUID();
}

export function createEvent() {
	return {
		id: generateId(),
		imageVersion: 0,
		title: 'banana',
		sizeTitle: 36,
		date: 'Sa. 31 oct.',
		hour: '10h',
		content: 'Me gusta banana',
		sizeDescription: 30,
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
