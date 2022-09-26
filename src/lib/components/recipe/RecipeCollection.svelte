<script lang="ts">
	import RecipePreview from './RecipePreview.svelte'

	export let type = 'recent'
	export let page = 1
	export let limit = 10

	export let username = ''
	export let search = ''

	const getRecipes = async () => {
		const res = await fetch(`/recipe?type=${type}&page=${page}&limit=${limit}&username=${username}&search=${search}`, { method: 'GET' })

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
		<div class="animate-pulse fake-collection flex flex-wrap place-items-center place-content-center">
			<div class="preview w-80 mb-2 mx-2 mt-2">
				<div class="preview-card  bg-white dark:bg-stone-800 shadow-md rounded-xl p-4" style="height: 401px" />
			</div>
			<div class="preview w-80 mb-2 mx-2 mt-2">
				<div class="preview-card  bg-white dark:bg-stone-800 shadow-md rounded-xl p-4" style="height: 401px" />
			</div>
			<div class="preview w-80 mb-2 mx-2 mt-2">
				<div class="preview-card  bg-white dark:bg-stone-800 shadow-md rounded-xl p-4" style="height: 401px" />
			</div>
			<div class="preview w-80 mb-2 mx-2 mt-2">
				<div class="preview-card  bg-white dark:bg-stone-800 shadow-md rounded-xl p-4" style="height: 401px" />
			</div>
		</div>
	{:then { recipesAndLinks }}
		<div class="recipes flex">
			{#if recipesAndLinks.length === 0}
				<h2 class="font-semibold my-2">No recipes found :(</h2>
			{:else}
				{#each recipesAndLinks as recipeAndLink}
					<RecipePreview recipe={recipeAndLink.recipe} link={recipeAndLink.link} />
				{/each}
			{/if}
		</div>

		<!-- <input type="number" name="" id="" bind:value={limit} /> -->
	{:catch error}
		<p style="color: red">{error.message}</p>
	{/await}
	<div class="nav-toolbar">
		<button
			class="bg-stone-200 dark:bg-stone-700 font-semibold rounded-lg h-10 px-4"
			style="opacity:{page > 1 ? 1 : 0.5}"
			on:click={() => {
				page--
				refreshReviews()
			}}
			disabled={page <= 1}>Last Page</button>
		<p class="font-bold">{page}</p>
		<button
			class="bg-stone-200 dark:bg-stone-700 font-semibold rounded-lg h-10 px-4"
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
