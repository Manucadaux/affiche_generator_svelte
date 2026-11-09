<script>
	import { onMount, tick } from 'svelte';
	import { useLocalStorage } from '#lib/utils/useLocalStorage.svelte.js';
	import { optionsLibrary, optionsMonth } from '#lib/data/options.js';
	import { goto } from '$app/navigation';
	import PageAffiche from '../../lib/components/PageAffiche.svelte';

	// Récupération des données sauvegardées
	const selectedLibraryId = useLocalStorage('selectedLibraryId', null);
	const selectedMonthId = useLocalStorage('selectedMonthId', null);
	const styles = useLocalStorage('styles', {});
	const pages = useLocalStorage('pages', []);

	// Retrouver les objets complets à partir des identifiants
	let selectedLibrary = $derived(
		optionsLibrary.find((option) => option.id === selectedLibraryId.current) ?? null
	);

	let selectedMonth = $derived(
		optionsMonth.find((option) => option.id === selectedMonthId.current) ?? null
	);

	// Affichage à taille réelle pour le PDF
	let pdfStyles = $derived({
		...styles.current,
		zoom: '100%'
	});

	let target = $state(null);
	let exporting = $state(false);
	let status = $state('Préparation du PDF...');

	async function exportPdf() {
		const { default: html2canvas } = await import('html2canvas-pro');
		const { jsPDF } = await import('jspdf');

		const pdf = new jsPDF({
			orientation: 'portrait',
			unit: 'mm',
			format: 'a3',
			compress: true
		});

		// Récupère les div contenues dans la div parent
		const divs = target.querySelectorAll(':scope > div');

		for (let i = 0; i < divs.length; i++) {
			const canvas = await html2canvas(divs[i], {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff',
				logging: false
			});

			const image = canvas.toDataURL('image/png');

			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();

			const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);

			const imageWidth = canvas.width * ratio;
			const imageHeight = canvas.height * ratio;

			const x = (pageWidth - imageWidth) / 2;
			const y = (pageHeight - imageHeight) / 2;

			if (i > 0) {
				pdf.addPage();
			}

			pdf.addImage(image, 'PNG', x, y, imageWidth, imageHeight);
		}

		pdf.save('document-A3.pdf');
		status = 'PDF généré avec succès !';

		// Retour à l'accueil après un court délai
		setTimeout(() => {
			goto('/');
		}, 1500);
	}

	onMount(async () => {
		await tick();

		await new Promise((resolve) => requestAnimationFrame(resolve));

		await document.fonts.ready;

		const images = [...target.querySelectorAll('img')];

		await Promise.all(images.map((img) => img.decode().catch(() => {})));

		await exportPdf();
	});
</script>

<div class="toolbar">
	<p>{status}</p>
</div>

<div class="renderer" bind:this={target}>
	{#each pages.current as page (page.id)}
		<PageAffiche {selectedLibrary} {selectedMonth} {page} styles={pdfStyles} />
	{/each}
</div>
