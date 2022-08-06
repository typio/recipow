<script lang="ts">
	import RecipeCollection from '$lib/components/recipe/RecipeCollection.svelte'

	let urlParams = new URLSearchParams()
	urlParams.set('hi', 'hello')
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<section>
	<h1>Welcome</h1>
</section>

<h2>Trending Recipes</h2>
<RecipeCollection {urlParams} />

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
