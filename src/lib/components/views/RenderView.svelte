<script>
	// @ts-nocheck
	import { onMount, tick } from 'svelte';

	import { optionsLibrary, optionsMonth } from '#lib/data/options.js';
	import { getDocument as getStoredDocument } from '#lib/utils/documentStorage.js';

	import PageAffiche from '#lib/components/page/PageAffiche.svelte';

	let { documentId, onFinish } = $props();

	/** @type {import('#lib/utils/types.js').AppDocument | null} */
	let activeDocument = $state(null);

	// Récupérer les données du document chargé
	let pages = $derived(activeDocument?.pages ?? []);

	let selectedLibrary = $derived(
		optionsLibrary.find((option) => option.id === activeDocument?.libraryId) ?? null
	);

	let selectedMonth = $derived(
		optionsMonth.find((option) => option.id === activeDocument?.monthId) ?? null
	);

	// Affichage à taille réelle pour le PDF
	let pdfStyles = $derived({
		...(activeDocument?.styles ?? {}),
		zoom: '100%'
	});

	let documentName = $derived(activeDocument?.name ?? 'Mon document');

	let target = $state(null);
	let exporting = $state(false);
	let status = $state('Préparation du PDF...');

	async function exportPdf() {
		if (exporting || !target) return;

		// Vérifier qu'il existe des affiches à exporter
		const divs = target.querySelectorAll(':scope > .page');

		if (divs.length === 0) {
			status = 'Aucune affiche à exporter.';
			return;
		}

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

			for (let i = 0; i < divs.length; i++) {
				const canvas = await html2canvas(divs[i], {
					scale: 3.125,
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
			const safeDocumentName =
				(documentName || 'Mon document')
					.trim()
					.replace(/[<>:"/\\|?*]/g, '-')
					.replace(/\s+$/g, '')
					.replace(/[. ]+$/, '') || 'Mon document';

			pdf.save(`${safeDocumentName}.pdf`);

			status = 'PDF généré avec succès !';

			// Retour à l'accueil après un court délai
			setTimeout(() => {
				onFinish();
			}, 1500);
		} catch (error) {
			console.error('Erreur lors de la génération du PDF :', error);
			status = 'Une erreur est survenue lors de la génération du PDF.';
			exporting = false;
		}
	}

	onMount(async () => {
		if (!documentId) {
			status = 'Aucun document sélectionné pour l’export.';
			return;
		}

		try {
			activeDocument = await getStoredDocument(documentId);

			if (!activeDocument) {
				status = 'Ce document est introuvable. Il a peut-être été supprimé.';
				return;
			}
		} catch (error) {
			console.error('Erreur lors du chargement du document :', error);
			status = 'Impossible de charger le document. Veuillez réessayer.';
			return;
		}

		await tick();

		// Attendre le rendu du navigateur
		await new Promise((resolve) => requestAnimationFrame(resolve));

		// Attendre le chargement des polices
		await document.fonts.ready;

		// Attendre le chargement des images
		// Attendre le chargement des images des évènements
		const events = [...target.querySelectorAll('.event')];

		while (events.some((event) => event.dataset.imageReady !== 'true')) {
			await new Promise((resolve) => requestAnimationFrame(resolve));
		}

		// Attendre également le décodage des images en arrière-plan
		const backgroundImages = [...target.querySelectorAll('.imgContainer')];

		await Promise.all(
			backgroundImages.map(async (container) => {
				const background = getComputedStyle(container).backgroundImage;
				const match = background.match(/^url\(["']?(.*?)["']?\)$/);

				if (!match) return;

				const image = new Image();
				image.src = match[1];

				await image.decode().catch(() => {});
			})
		);

		await exportPdf();
	});
</script>

<!-- Barre d'information -->
<div class="toolbar">
	<p>{status}</p>
	<button onclick={onFinish} disabled={exporting}> Retour à l'éditeur </button>
</div>

<!-- Affiches à exporter -->
<div class="renderer" bind:this={target}>
	{#each pages as page (page.id)}
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
