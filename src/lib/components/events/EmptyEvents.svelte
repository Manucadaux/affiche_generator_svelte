<script>
	import { CalendarPlus } from 'lucide-svelte';
</script>

<div class="flex flex-1 flex-col items-center justify-center px-6 text-center">
	<div
		class="mb-6 flex size-20 items-center justify-center rounded-full bg-base-200 text-base-content/50"
	>
		<CalendarPlus size={36} />
	</div>

	<h2 class="text-2xl font-semibold">Aucun événement pour le moment</h2>

	<p class="mt-3 max-w-md text-base-content/60">
		Créez votre premier événement pour commencer à organiser les animations de votre médiathèque.
	</p>

	<button type="button" class="btn mt-6 cursor-pointer btn-primary"> Créer un événement </button>
</div>
