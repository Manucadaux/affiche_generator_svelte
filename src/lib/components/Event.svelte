<script>
	let { event, styles } = $props();
</script>

<div>
	<p style:background={styles.bgTitle} style:color={styles.colorTitle}>
		{event.title}
	</p>
	<div style:background={styles.bgDate} style:color={styles.colorDate}>
		<p>{event.date}</p>
		<p>{event.hour}</p>
	</div>
	<p style:color={styles.colorContent}>{event.content}</p>
</div>
