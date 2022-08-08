<script lang="ts">
	import { goto } from '$app/navigation'

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
		const res = await fetch(`/recipe`, {
			method: 'DELETE',
			body: JSON.stringify({
				recipeId: recipe.id
			})
		})
		const data = await res.json()
		console.log(data)
		goto('/')
	}
</script>

<svelte:head>
	<title>{recipe.title}</title>
</svelte:head>

<div class="content">
	<div class="header">
		<h1 class="title">{recipe.title}</h1>
		<h2 class="description">{recipe.description}</h2>
		<img class="cover_image" src={recipe.cover_image} alt="" />
	</div>

	<div class="details">
		{#if $session.user?.username === username}
			<button class="btn btn-danger" on:click={deleteRecipe}>Delete Recipe</button>
		{:else}
			Written by <a href="/@{username}">{'@' + username}</a>
		{/if}
	</div>

	{#each recipe.content as content, rI}
		<div class="content-card ">
			{#if typeof content === 'string'}
				<div class="write-up rendered-tiptap">
					{@html content}
				</div>
			{:else if typeof content === 'object'}
				<div class="recipe-card">
					<div class="recipe-header">
						{#if recipe.content.filter(el => typeof el === 'object').length > 1}
							<div class="recipe-card-header">
								<h1 class="title">{content.title}</h1>
								<h2 class="description">{content.description}</h2>
								<img class="cover_image" src={content.cover_image} alt="" />
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
									<div class="instruction rendered-tiptap">
										{@html step}
									</div>
								</li>
							{/each}
						</ol>
					</div>

					<h3>Times:</h3>
					<div class="times">
						<div class="time-input">
							<h4>Prep Time</h4>
							<p>{content.times.prep.minutes}</p>
							<p class="time-unit">mins</p>
							<p>{content.times.prep.hours}</p>
							<p class="time-unit">hours</p>
							<p>{content.times.prep.days}</p>
							<p class="time-unit">days</p>
						</div>
						<div class="time-input">
							<h4>Cook Time</h4>
							<p>{content.times.cook.minutes}</p>
							<p class="time-unit">mins</p>
							<p>{content.times.cook.hours}</p>
							<p class="time-unit">hours</p>
							<p>{content.times.cook.days}</p>
							<p class="time-unit">days</p>
						</div>
						<div class="time-input">
							<h4>Total Time</h4>
							<p class="time-total-number">
								{(content.times.prep.minutes + content.times.cook.minutes) % 60}
							</p>
							<p class="time-unit">mins</p>
							<p class="time-total-number">
								{(Math.floor((content.times.prep.minutes + content.times.cook.minutes) / 60) +
									(content.times.prep.hours + content.times.cook.hours)) %
									24}
							</p>
							<p class="time-unit">hours</p>
							<p class="time-total-number">
								{Math.floor(
									(Math.floor((content.times.prep.minutes + content.times.cook.minutes) / 60) +
										(content.times.prep.hours + content.times.cook.hours)) /
										24
								) +
									(content.times.prep.days + content.times.cook.days)}
							</p>
							<p class="time-unit">days</p>
						</div>
					</div>
					<div>
						<div class="row">
							<h3>Servings</h3>
							{content.serves}
						</div>
						<div class="row">
							<h3>Yield</h3>
							{content.yield}
						</div>
						<h3>Notes</h3>
						<div class="rendered-tiptap">
							{@html content.notes}
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		align-items: center;
		align-content: center;
	}
	.row > h3 {
		margin: 1rem 1rem 1rem 0;
	}

	.content {
		position: relative;
	}

	.header {
		display: flex;
		flex-wrap: wrap;
		text-align: center;
		align-items: center;
		justify-content: center;
	}

	.header .title {
		width: 100%;
	}

	.header .description {
		width: 100%;
	}

	 .cover_image {
		width: 100%;
		height: auto;
		max-height: 300px;
		object-fit: cover;
	}

	.details {
		margin: 1rem 1rem 1rem 0;
	}

	.content-card {
		border: #eee solid 3px;
		border-radius: 0.4rem;
		margin-bottom: 2rem;
	}

	.write-up {
		margin: 3rem 3rem;
	}

	.recipe-card {
		padding: 2rem;
	}

	.recipe-header {
		display: grid;
	}

	.ingredient {
		display: flex;
	}

	li {
		padding: 1rem 0;
	}

	.instruction {
		display: flex;
	}

	.times {
		width: 55%;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr 1fr 1fr;
		gap: 1rem 4rem;
		margin: 1rem 0;
	}

	.time-input {
		display: grid;
		grid-template-columns: 6fr 2fr 1fr 2fr 1fr 2fr 1fr;
		grid-template-rows: 1fr;
		/* gap: 1rem 4rem; */
	}

	.time-input > p,
	.time-input > .time-total-number {
		text-align: right;
	}

	.time-input > .time-unit {
		padding: 0 2rem 0 1rem;
	}
</style>
