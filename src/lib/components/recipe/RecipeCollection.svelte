<script lang="ts">
	import RecipePreview from './RecipePreview.svelte'

	export let type = 'recent'
	export let page = 1
	export let limit = 10

	export let username = ''
	export let search = ''

	const getRecipes = async () => {
		const res = await fetch(
			`/recipe?type=${type}&page=${page}&limit=${limit}&username=${username}&search=${search}`,
			{ method: 'GET' }
		)

		const recipesAndLinks = await res.json()
		if (recipesAndLinks.length === 0) {
			return []
		}

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
			{#if recipesAndLinks.length === 0}
				<p>No recipes found :(</p>
			{:else}
				{#each recipesAndLinks as recipeAndLink}
					<div class="recipe-preview">
						<RecipePreview recipe={recipeAndLink.recipe} link={recipeAndLink.link} />
					</div>
				{/each}
			{/if}
		</div>

		<!-- <input type="number" name="" id="" bind:value={limit} /> -->
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}
	<div class="nav-toolbar">
		<button
			class="btn"
			style="opacity:{page > 1 ? 1 : 0.5}"
			on:click={() => {
				page--
				refreshReviews()
			}}
			disabled={page <= 1}>Last Page</button>
		<p>{page}</p>
		<button
			class="btn"
			on:click={() => {
				page++
				refreshReviews()
			}}>Next Page</button>
	</div>
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
		width: 2rem;
		text-align: center;
	}

</style>
