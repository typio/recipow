<script lang="ts">
	import { session } from '$app/stores'

	import type { Recipe } from '$lib/types'

	export let recipe: Recipe
	export let username: string

	// const units = [
	// 	['gram', 'g'],
	// 	['kilogram', 'kg'],
	// 	['pound', 'lb'],
	// 	['ounce', 'oz'],
	// 	['milliliter', 'ml'],
	// 	['liter', 'l'],
	// 	['cup', 'c'],
	// 	['pint', 'pt'],
	// 	['quart', 'qt'],
	// 	['gallon', 'gal'],
	// 	['fluid ounce', 'fl oz'],
	// 	['teaspoon', 'tsp'],
	// 	['tablespoon', 'tbsp']
	// ]

	const deleteRecipe = async () => {
		await fetch(`/recipe`, {
			method: 'DELETE',
			body: JSON.stringify({
				recipeId: recipe.id
			})
		})
	}
</script>

<svelte:head>
	<title>{recipe.title}</title>
</svelte:head>

<div class="content">
	<h1>{recipe.title}</h1>
	<h2>{recipe.description}</h2>
	<img src={recipe.cover_image_url} alt="" />

	{#if $session.user?.username === username}
		<button class="btn btn-danger" on:click={deleteRecipe}>Delete Recipe</button>
	{:else}
		Written by <a href="/@{username}" >{'@' + username}</a>
	{/if}

	{#each recipe.content as content, rI}
		<div class="content-card ">
			{#if typeof content === 'string'}
				<div class="write-up">
					{@html content}
				</div>
			{:else if typeof content === 'object'}
				<div class="recipe-card">
					<div class="recipe-header">
						{#if recipe.content.filter(el => typeof el === 'object').length > 1}
							<div class="recipe-card-header">
								<h1>{content.title}</h1>
								<h2>{content.description}</h2>
								<img src={content.cover_image_url} alt="" />
							</div>
						{/if}
					</div>

					<div>
						<h3>Ingredients:</h3>
						<div class="ingredient-list">
							<ul>
								{#each content.ingredients ?? [] as ingredient, iI}
									<li>
										<div class="ingredient">
											{ingredient}
										</div>
									</li>
								{/each}
							</ul>
						</div>
					</div>

					<div>
						<h3>Instructions:</h3>
						<ol>
							{#each content.steps ?? [] as step, sI}
								<li>
									<div class="instruction">
										{@html step}
									</div>
								</li>
							{/each}
						</ol>
					</div>

					<div>
						<h3>Times:</h3>
						<div class="time">
							<h4>Prep Time</h4>
							{content.times.prep.minutes}
							<p>mins</p>
							{content.times.prep.hours}
							<p>hours</p>
							{content.times.prep.days}
							<p>days</p>
						</div>
						<div class="time">
							<h4>Cook Time</h4>
							{content.times.cook.minutes}
							<p>mins</p>
							{content.times.cook.hours}
							<p>hours</p>
							{content.times.cook.days}
							<p>days</p>
						</div>
						<div class="time">
							<h4>Total Time</h4>
							<p>{(content.times.prep.minutes + content.times.cook.minutes) % 60}</p>
							<p>mins</p>
							<p>
								{(Math.floor((content.times.prep.minutes + content.times.cook.minutes) / 60) +
									(content.times.prep.hours + content.times.cook.hours)) %
									24}
							</p>
							<p>hours</p>
							<p>
								{Math.floor(
									(Math.floor((content.times.prep.minutes + content.times.cook.minutes) / 60) +
										(content.times.prep.hours + content.times.cook.hours)) /
										24
								) +
									(content.times.prep.days + content.times.cook.days)}
							</p>
							<p>days</p>
						</div>
					</div>
					<div>
						<h3>Servings</h3>
						{content.serves}
						<h3>Yield</h3>
						{content.yield}
						<h3>Notes</h3>
						{@html content.notes}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.content {
		position: relative;
	}

	.content-card {
		border: #eee solid 3px;
		border-radius: 0.4rem;
	}

	.recipe-card {
		padding: 2rem;
	}

	.recipe-header {
		display: grid;
	}

	.ingredient-list {
	}

	.ingredient {
		display: flex;
	}

	.ingredient ul {
		display: flex;
		flex-direction: row;
		margin-bottom: 1rem;
		list-style: none;
	}

	.ingredient li {
		width: fit-content;
		margin: 0 1rem 0 0;
	}

	.ingredient input {
		width: auto;
	}

	.instruction {
		display: flex;
	}

	.time {
		display: flex;
		flex-wrap: row;
	}

	.time {
	}
</style>
