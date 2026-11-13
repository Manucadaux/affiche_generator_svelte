import { defaultEventOptions } from '#lib/data/options.js';

export function generateId() {
	return crypto.randomUUID();
}

export function createEvent() {
	return {
		id: generateId(),
		...defaultEventOptions
	};
}

export function createPage() {
	return {
		id: generateId(),
		reverse: false,
		events: [createEvent()]
	};
}
