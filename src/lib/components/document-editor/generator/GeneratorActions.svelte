<script>
	let { onResetEvents, onResetAll, renderHref } = $props();
</script>

<div>
	<div class="containerBtnPdf">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href={renderHref} class="btn btn-block btn-primary"> Générer PDF </a>
	</div>

	<div class="collapse-arrow collapse mt-4 rounded-box border border-base-content/20">
		<input type="checkbox" />
		<div class="collapse-title font-medium">Réinitialisation</div>

		<div class="collapse-content">
			<div class="flex flex-col gap-3 pt-2">
				<button class="btn btn-warning" onclick={onResetEvents}>
					Réinitialiser les évènements
				</button>

				<button class="btn btn-error" onclick={onResetAll}> Réinitialiser tout </button>
			</div>
		</div>
	</div>
</div>

<p class="mt-6 text-sm text-base-content/60">
	Un problème ou un bug ? Veuillez me contacter par mail
	<a href="mailto:m.ortiz@agglo-pau.fr" class="link"> m.ortiz@agglo-pau.fr </a>
	ou par Teams !
</p>

<style>
	.containerBtnPdf {
		margin: 25px 0;
	}

	.collapse > input[type='checkbox'] {
		position: absolute;
		inset: 0 0 auto 0;
		width: 100%;
		height: 56px;
	}
</style>
