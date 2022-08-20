<script lang="ts">
	import RecipeCollection from '$lib/components/recipe/RecipeCollection.svelte'
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="The first fighting themed recipe website!" />
</svelte:head>

<section>
	
</section>

<h2>🔥 HOT Recipes 🔥</h2>
<RecipeCollection type={'trending'} />

<h2>All Recipes</h2>
<RecipeCollection type={'all'} />

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
