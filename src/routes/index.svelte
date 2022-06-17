<script context="module">
	const response = await fetch('api/test.json.js')
</script>

<script>
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>Welcome</h1>

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}
</style>
