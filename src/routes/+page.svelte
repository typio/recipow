<script lang="ts">
	import RecipeCollection from '$lib/components/recipe/RecipeCollection.svelte'

	let searchInputText = ''
	$: searchQuery = ''
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="The first fighting themed recipe website!" />
</svelte:head>

<section />

<h2>Trending Recipes</h2>
<RecipeCollection type={'trending'} />

<h2>Search for Recipes</h2>
<div class="searchRow">
	<input type="text" bind:value={searchInputText} placeholder="Search" />
	<button
		class="btn"
		on:click={() => {
			searchQuery = searchInputText
		}}>Search</button>
</div>

{#key searchQuery}
	{#if searchQuery}
		<RecipeCollection type={'search'} search={searchQuery} />
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

	.searchRow {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.searchRow input {
		padding-left: 1rem;
		border: none;
		border-bottom: 3px solid #222;
		margin-right: 2rem;
	}

	.searchRow input:focus {
		outline: none;
	}

	h2 {
		width: 100%;
		margin-top: 3rem;
	}
</style>
