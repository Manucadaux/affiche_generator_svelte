import { tick } from 'svelte';

/** @param {string} pageId */
export async function scrollToPage(pageId) {
	await tick();

	document.getElementById(`page-${pageId}`)?.scrollIntoView({
		behavior: 'smooth',
		block: 'start'
	});
}
