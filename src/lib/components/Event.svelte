<script>
	let { event, styles, nbEvents, reverse } = $props();

	let eventClass = $derived(['uno', 'duo', 'trio', 'quatro'][nbEvents - 1] ?? 'uno');
</script>

<div class={`event ${eventClass}`} class:reverse>
	<p style:background={styles.bgTitle} style:color={styles.colorTitle}>
		{event.title}
	</p>
	<div style:background={styles.bgDate} style:color={styles.colorDate}>
		<p>{event.date}</p>
		<p>{event.hour}</p>
	</div>
	<p style:color={styles.colorContent}>{event.content}</p>
</div>

<style>
	.uno {
		/* Mise en page pour un évènement */
	}

	.duo {
		/* Mise en page pour deux évènements */
	}

	.trio {
		/* Mise en page pour trois évènements */
	}

	.quatro {
		/* Mise en page pour quatre évènements */
	}
</style>
