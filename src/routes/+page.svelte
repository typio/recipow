<script lang="ts">
	const RecipeCollectionPromise = import('$lib/components/recipe/RecipeCollection.svelte')

	let searchInputText = ''
	$: searchQuery = ''
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="The first fighting themed recipe website!" />
</svelte:head>

<section />

<h2 class="font-semibold text-2xl mb-2 ml-4">Trending Recipes</h2>
{#await RecipeCollectionPromise}
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
{:then { default: RecipeCollection }}
	<RecipeCollection type={'trending'} />
{/await}

<h2 class="font-semibold text-xl mt-8 mb-2 ml-4">Search for Recipes</h2>
<form
	class="flex place-content-center space-x-4 mb-4"
	on:submit={e => {
		e.preventDefault()
	}}>
	<input
		class="semibold rounded-lg pl-4 font-semibold placeholder:text-stone-400 dark:bg-stone-600 shadow-sm 
	focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
		type="text"
		bind:value={searchInputText}
		placeholder="Search" />
	<button
		class="bg-stone-200 dark:bg-stone-700 font-semibold rounded-lg h-10 px-4"
		on:click={() => {
			searchQuery = searchInputText
		}}>Search</button>
</form>

{#key searchQuery}
	{#if searchQuery}
		{#await RecipeCollectionPromise}
			<h2 class="font-semibold">Loading Recipies...</h2>
		{:then { default: RecipeCollection }}
			<RecipeCollection type={'search'} search={searchQuery} />
		{/await}
	{/if}
{/key}

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}
</style>
