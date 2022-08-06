<script context="module" lang="ts">
	export const load = () => {
		console.log('loaded')
	}
</script>

<script lang="ts">
	import RecipePreview from './RecipePreview.svelte'

	export let urlParams: URLSearchParams

	const getRecipes = async () => {
		const res = await fetch(`/recipe?${urlParams.toString()}`, { method: 'GET' })

		const recipesAndLinks = await res.json()

		return recipesAndLinks
	}
</script>

<div class="recipe-collection">
	{#await getRecipes()}
		<p>loading recipes...</p>
	{:then { recipesAndLinks }}
		{#each recipesAndLinks as recipeAndLink}
			<div class="recipe-preview">
				<RecipePreview recipe={recipeAndLink.recipe} link={recipeAndLink.link} />
			</div>
		{/each}
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}
</div>

<style>
	.recipe-collection {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}

	.recipe-preview {
		width: 30%;
	}
</style>
