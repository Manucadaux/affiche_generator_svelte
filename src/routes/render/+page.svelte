<script>
	import PageAffiche from '../../lib/components/PageAffiche.svelte';
	let target = $state();

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
	}
</script>

<div class="renderer" bind:this={target}>
	<PageAffiche />
</div>
