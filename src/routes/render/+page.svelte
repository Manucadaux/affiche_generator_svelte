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
		if (exporting || !target) return;

		exporting = true;
		status = 'Génération du PDF en cours...';

		// Laisse le temps à Svelte d'afficher le loader
		await tick();

		try {
			// Import des bibliothèques
			const { default: html2canvas } = await import('html2canvas-pro');
			const { jsPDF } = await import('jspdf');

			const pdf = new jsPDF({
				orientation: 'portrait',
				unit: 'mm',
				format: 'a3',
				compress: true
			});

			// Récupérer les affiches à exporter
			const divs = target.querySelectorAll(':scope > .page');

			if (divs.length === 0) {
				status = 'Aucune affiche à exporter.';
				return;
			}

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

			// Télécharger le PDF
			pdf.save('document-A3.pdf');

			status = 'PDF généré avec succès !';

			// Retour à l'accueil après un court délai
			setTimeout(() => {
				goto('/');
			}, 1500);
		} catch (error) {
			console.error('Erreur lors de la génération du PDF :', error);
			status = 'Une erreur est survenue lors de la génération du PDF.';
			exporting = false;
		}
	}

	onMount(async () => {
		await tick();

		// Attendre le rendu du navigateur
		await new Promise((resolve) => requestAnimationFrame(resolve));

		// Attendre le chargement des polices
		await document.fonts.ready;

		// Attendre le chargement des images
		const images = [...target.querySelectorAll('img')];

		await Promise.all(images.map((img) => img.decode().catch(() => {})));

		await exportPdf();
	});
</script>

<!-- Barre d'information -->
<div class="toolbar">
	<p>{status}</p>
</div>

<!-- Affiches à exporter -->
<div class="renderer" bind:this={target}>
	{#each pages.current as page (page.id)}
		<PageAffiche {selectedLibrary} {selectedMonth} {page} styles={pdfStyles} />
	{/each}
</div>

<!-- Superposition et loader -->
{#if exporting}
	<div class="loadingOverlay">
		<div class="loaderContent">
			<span class="loader"></span>
			<p>{status}</p>
			<p>Veuillez patienter...</p>
		</div>
	</div>
{/if}

<style>
	.toolbar {
		padding: 15px;
		text-align: center;
	}

	.renderer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.loadingOverlay {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loaderContent {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		color: white;
		font-size: 1.2rem;
	}

	.loader {
		width: 60px;
		height: 60px;
		border: 6px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
