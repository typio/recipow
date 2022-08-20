<script lang="ts">
	import RecipePreview from './RecipePreview.svelte'

	export let type = 'recent'
	export let page = 1
	export let limit = 10

	export let username = ''

	const getRecipes = async () => {
		const res = await fetch(
			`/recipe?type=${type}&page=${page}&limit=${limit}&username=${username}`,
			{ method: 'GET' }
		)

		const recipesAndLinks = await res.json()

		return recipesAndLinks
	}

	let doGetRecipes = getRecipes()

	const refreshReviews = async () => {
		doGetRecipes = getRecipes()
	}
</script>

<div class="recipe-collection">
	{#await doGetRecipes}
		<p>loading recipes...</p>
	{:then { recipesAndLinks }}
		<div class="recipes">
			{#each recipesAndLinks as recipeAndLink}
				<div class="recipe-preview">
					<RecipePreview recipe={recipeAndLink.recipe} link={recipeAndLink.link} />
				</div>
			{/each}
		</div>
		<div class="nav-toolbar">
			{#if page > 1}
				<button
					on:click={() => {
						page--
						refreshReviews()
					}}>Last Page</button>
			{/if}
			<p>{page}</p>
			<button
				on:click={() => {
					page++
					refreshReviews()
				}}>Next Page</button>
		</div>

		<!-- <input type="number" name="" id="" bind:value={limit} /> -->
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}
</div>

<style>
	.recipe-collection {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}

	.recipes {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}

	.nav-toolbar {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
	}

	.nav-toolbar p {
		margin: 1rem 1rem;
	}

	.recipe-preview {
		width: 300px;
	}
</style>
