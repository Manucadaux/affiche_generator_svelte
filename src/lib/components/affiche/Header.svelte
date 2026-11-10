<script>
	let { selectedLibrary, selectedMonth, styles } = $props();
</script>

<h2 style:color={styles.bgDate}>
	Médiathèque {selectedLibrary && selectedLibrary.text}
</h2>

<h3 style:background={styles.bgDate} style:color={styles.colorDate}>
	évènements
	<br />
	du mois {selectedMonth && selectedMonth.text}
</h3>

<style>
	h2,
	h3 {
		font-family: 'Pau Display', sans-serif;
		text-transform: uppercase;
	}

	h2 {
		font-size: 50px;
		padding-top: 20px;
	}

	h3 {
		display: inline-block;
		font-size: 40px;
		padding: 20px 40px;
		margin-top: 15px;
		margin-bottom: 20px;
		line-height: 1.1;
	}
</style>
