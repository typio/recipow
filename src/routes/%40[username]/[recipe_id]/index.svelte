<script lang="ts">
	import { goto } from '$app/navigation'

	import { session } from '$app/stores'

	import type { Recipe } from '$lib/types'
	import { units } from '$lib/unitData'

	import recipow_fist from '$lib/assets/recipow-fist.svg'
	import recipow_fist_filled from '$lib/assets/recipow-fist-filled.svg'

	export let recipe: Recipe
	export let username: string

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

	const getTime = (rI?: number, type?: 'prep' | 'cook' | 'total'): string => {
		let totalTime = [0, 0, 0]
		if (rI === undefined) {
			recipe.content.forEach(c => {
				if (typeof c === 'object') {
					if (type === 'total' || type === undefined) {
						totalTime[0] += (c.times.cook.minutes + c.times.prep.minutes) % 60

						totalTime[1] +=
							(Math.floor((c.times.prep.minutes + c.times.cook.minutes) / 60) +
								(c.times.prep.hours + c.times.cook.hours)) %
							24
						totalTime[2] +=
							Math.floor(
								(Math.floor((c.times.prep.minutes + c.times.cook.minutes) / 60) +
									(c.times.prep.hours + c.times.cook.hours)) /
									24
							) +
							(c.times.prep.days + c.times.cook.days)
					} else {
						totalTime[0] += c.times[type].minutes
						totalTime[1] += c.times[type].hours
						totalTime[2] += c.times[type].days
					}
				}
			})
		} else {
			let c = recipe.content[rI]
			if (typeof c === 'object') {
				if (type === 'total' || type === undefined) {
					totalTime[0] += (c.times.cook.minutes + c.times.prep.minutes) % 60
					totalTime[1] +=
						(Math.floor((c.times.prep.minutes + c.times.cook.minutes) / 60) +
							(c.times.prep.hours + c.times.cook.hours)) %
						24
					totalTime[2] +=
						Math.floor(
							(Math.floor((c.times.prep.minutes + c.times.cook.minutes) / 60) +
								(c.times.prep.hours + c.times.cook.hours)) /
								24
						) +
						(c.times.prep.days + c.times.cook.days)
				} else {
					totalTime[0] += c.times[type].minutes
					totalTime[1] += c.times[type].hours
					totalTime[2] += c.times[type].days
				}
			}
		}
		return (
			(totalTime[2] > 0 ? totalTime[2] + 'd' : '') +
				(totalTime[1] > 0 ? totalTime[1] + 'h' : '') +
				(totalTime[0] > 0 ? totalTime[0] + 'm' : '') || '-'
		)
	}
</script>

<svelte:head>
	<title>{recipe.title}</title>
	<meta name="description" content={recipe.description} />
	<meta name="author" content={'@' + username} />
</svelte:head>

<div class="content">
	<div class="header">
		<h1 class="title">{recipe.title}</h1>
		<h2 class="description">{recipe.description}</h2>
		<div class="header-total-time">
			<p>Total Time</p>
			<p class="header-time-value">{getTime(undefined, 'total')}</p>
			<p>Prep</p>
			<p class="header-time-value">{getTime(undefined, 'prep')}</p>
			<p>Cook</p>
			<p class="header-time-value">{getTime(undefined, 'cook')}</p>
		</div>
		<div class="ratings">
			<!-- <img src={recipow_fist} alt="" />
			<img src={recipow_fist_filled} alt="" />
			<svg>{@html recipow_fist}</svg> -->
		</div>
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
											<h4 class="ingredient-name">
												{ingredient?.name}
											</h4>
											<h5 class="ingredient-preperation">
												{ingredient?.preperation}
											</h5>

											<h4 class="ingredient-amount">
												{ingredient?.amount + '' + ingredient?.unit?.abbr[0]}
											</h4>
										</div>
									</li>
								{/each}
							</ul>
						</div>
					</div>

					<div class="nutrition">
						{#if content.nutrition?.calories}
							<li>
								<p class="nutrition-amount">{content.nutrition.calories}</p>
								<div class="nutrition-label">Calories</div>
							</li>
						{/if}
						{#if content.nutrition?.protein}
							<li>
								<p class="nutrition-amount">{content.nutrition.protein}</p>
								<div class="nutrition-label">Protein</div>
							</li>
						{/if}
						{#if content.nutrition?.fat}
							<li>
								<p class="nutrition-amount">{content.nutrition.fat}</p>
								<div class="nutrition-label">Fat</div>
							</li>
						{/if}
						{#if content.nutrition?.carbs}
							<li>
								<p class="nutrition-amount">{content.nutrition.carbs}</p>
								<div class="nutrition-label">Carbs</div>
							</li>
						{/if}
						{#if content.nutrition?.fiber}
							<li>
								<p class="nutrition-amount">{content.nutrition.fiber}</p>
								<div class="nutrition-label">Fiber</div>
							</li>
						{/if}
						{#if content.nutrition?.sugar}
							<li>
								<p class="nutrition-amount">{content.nutrition.sugar}</p>
								<div class="nutrition-label">Sugar</div>
							</li>
						{/if}
					</div>

					<div>
						<h3>Instructions:</h3>

						<div class="instruction-list">
							{#each content.steps ?? [] as step, sI}
								<div class="instruction-number">{sI + 1}</div>
								<div class="instruction rendered-tiptap">
									{@html step}
								</div>
							{/each}
						</div>
					</div>

					<h3>Times:</h3>
					<div class="times">
						<div class="row">
							<h4>Total</h4>
							<p>{getTime(rI, 'total')}</p>
						</div>
						<div class="row">
							<h4>Prep</h4>
							<p>{getTime(rI, 'prep')}</p>
						</div>
						<div class="row">
							<h4>Cook</h4>
							<p>{getTime(rI, 'cook')}</p>
						</div>
					</div>
					<div>
						<div class="row">
							<h3>Servings</h3>
							{content.serves}
						</div>
						{#if content.yield !== ''}
							<div class="row">
								<h3>Yield</h3>
								{content.yield}
							</div>
						{/if}
						{#if content.notes !== '<p></p>'}
							<h3>Notes</h3>
							<div class="rendered-tiptap">
								{@html content.notes}
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.content {
		display: grid;
		position: relative;
	}

	.row {
		display: flex;
		flex-direction: row;
		align-items: center;
		align-content: center;
	}
	.row > h3 {
		margin: 1rem 1rem 1rem 0;
	}

	.header {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		border-radius: 1.2rem;
		background-color: #ffffff;
		height: 30rem;
		padding: 1rem;
	}

	.header .title {
		grid-column: 1/7;
		font-weight: 600;
		font-size: 3rem;
		line-height: 110%;
	}

	.header .description {
		grid-column: 1/6;
		position: relative;
		font-weight: 400;
		top: 0px;
	}

	.header-total-time {
		grid-column: 2/8;
		display: flex;
	}

	.header-total-time p {
		font-size: 1.2rem;
		line-height: 110%;
		margin-right: 0.3rem;
	}

	.header-total-time .header-time-value {
		font-weight: 600;
		margin-right: 2rem;
	}

	.ratings {
		grid-column: 1/6;
		display: flex;
		flex-direction: row;
		align-items: center;
		align-content: center;
	}

	.ratings img {
		width: 3rem;
	}

	.header-nutrition {
		grid-column: 1/6;
		list-style: none;
		display: flex;
	}

	.header-nutrition li {
		background-color: dodgerblue;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 1rem;
		margin: 0.5rem;
		border-radius: 2.5rem;
		width: 5rem;
		height: 6.5rem;
	}

	.nutrition {
		margin-top: 1rem;
		grid-column: 1/6;
		list-style: none;
		display: flex;
	}

	.nutrition li {
		background-color: dodgerblue;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 1rem;
		margin: 0.5rem;
		border-radius: 2.5rem;
		width: 5rem;
		height: 6.5rem;
	}

	.nutrition-amount {
		display: flex;
		text-align: center;
		justify-content: center;
		background-color: navy;
		color: white;
		border-radius: 50%;
		width: 3rem;
		height: 3rem;
		line-height: 3rem;
		margin: 0;
	}

	.nutrition-label {
		color: #fff;
		margin-top: 0.5rem;
	}

	.cover_image {
		-webkit-filter: drop-shadow(1px 2px 8px rgb(175, 175, 175));
		filter: drop-shadow(1px 2px 8px rgb(175, 175, 175));

		text-align: right;
		max-width: 500px;
		position: absolute;
		top: 4rem;
		right: -3rem;
	}

	.details {
		margin: 1rem 1rem 1rem 0;
	}

	.content-card {
		border: #eee solid 3px;
		border-radius: 0.4rem;
		margin-bottom: 2rem;
		overflow: hidden;
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

	.instruction {
		display: flex;
	}

	li {
		padding-bottom: 1rem 0;
	}

	.ingredient {
		display: flex;
	}
	.ingredient-list ul {
		list-style: none;
		padding: 0;
		margin-left: 2rem;
	}

	.ingredient {
		display: grid;
		width: 100%;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
	}

	.ingredient-name {
		grid-column: 1;
		grid-row: 1;
		font-size: 1.25rem;
		margin: 0;
	}

	.ingredient-preperation {
		grid-column: 1;
		grid-row: 2;
		font-size: 0.875rem;
		margin: 0;
	}

	.ingredient-preperation {
		padding: 0;
	}

	.ingredient-amount {
		margin: 0;
	}

	.instruction-list {
		display: flex;
		flex-direction: row;
	}

	.instruction-number {
		font-size: 1.25rem;
		margin: auto 1rem auto 2rem;
	}

	.times {
		display: flex;
		margin: -1rem 0 0 2rem;
	}

	.times h4 {
		margin-right: 0.5rem;
	}
	.times p {
		margin-right: 2rem;
	}
</style>
