<script context="module" lang="ts">
	// import type { Load } from '@sveltejs/kit'
	// // if not logged in redirect to home page
	// export const load: Load = async ({ session }) => {
	// 	if (!session.user) {
	// 		return {
	// 			status: 302,
	// 			redirect: '/'
	// 		}
	// 	} else {
	// 		return {
	// 			status: 200
	// 		}
	// 	}
	// }
</script>

<script lang="ts">
	import TipTapEditor from '$lib/components/header/TipTapEditor.svelte'

	import type { Recipe, RecipeCardData } from '$lib/types'

	let recipe: Recipe = {
		title: '',
		description: '',
		content: ['hey', { times: {} } as unknown as RecipeCardData],
		tags: [],
		reviews: {
			rating: 0,
			reviewCount: 0
		},
		visibility: 'public'
	}

	let newIngredients: string[] = []
	let newSteps: string[] = []

	const units = [
		['gram', 'g'],
		['kilogram', 'kg'],
		['pound', 'lb'],
		['ounce', 'oz'],
		['milliliter', 'ml'],
		['liter', 'l'],
		['cup', 'c'],
		['pint', 'pt'],
		['quart', 'qt'],
		['gallon', 'gal'],
		['fluid ounce', 'fl oz'],
		['teaspoon', 'tsp'],
		['tablespoon', 'tbsp']
	]

	const addIngredient = (rI: number) => {
		if (typeof recipe.content[rI] === 'object') {
			if (recipe.content[rI].ingredients === undefined) {
				recipe.content[rI].ingredients = []
			}
			recipe.content[rI].ingredients = [...recipe.content[rI].ingredients, newIngredients[rI]]
			newIngredients[rI] = ''
		}
	}

	const addStep = (rI: number) => {
		if (typeof recipe.content[rI] === 'object') {
			if (recipe.content[rI].steps === undefined) {
				recipe.content[rI].steps = []
			}
			recipe.content[rI].steps.push(newSteps[rI])
			recipe.content[rI].steps = [...recipe.content[rI].steps]
			newSteps[rI] = ''
		}
	}
</script>

<svelte:head>
	<title>New Recipe</title>
</svelte:head>

<div class="content">
	<div class="recipe-header-input">
		<input class="recipe-title" type="text" placeholder="Recipe Title" bind:value={recipe.title} />
		<input
			class="recipe-description"
			type="text"
			placeholder="Description"
			bind:value={recipe.description} />
		<input
			class="recipe-cover-photo"
			type="file"
			name=""
			id=""
			bind:value={recipe.cover_image_url} />
	</div>

	<button
		on:click={() => {
			recipe.content = ['', ...recipe.content]
		}}>Add Another WriteUp</button>
	<button
		on:click={() => {
			recipe.content = [{}, ...recipe.content]
		}}>Add Another Recipe Card</button>
	{#each recipe.content as content, rI}
		<div class="content-card">
			<button
				on:click={() => {
					// recipe.content.splice(rI,1)
					// recipe.content = recipe.content
					let contentWithRemoved = [...recipe.content.slice(0, rI), ...recipe.content.slice(rI + 1)]

					if (contentWithRemoved.find(e => typeof e === 'object') !== undefined) {
						recipe.content = contentWithRemoved
					}
				}}>Remove</button>

			{#if typeof content === 'string'}
				<div class="write-up">
					<h3>Write Up:</h3>
					<TipTapEditor bind:content />
				</div>
			{:else if typeof content === 'object'}
				<div class="recipe-card-input">
					<div class="recipe-header-input">
						{#if recipe.content.filter(el => typeof el === 'object').length > 1}
							<input class="recipe-title" type="text" placeholder="Recipe Title" />
							<input class="recipe-description" type="text" placeholder="Description" />
							<input class="recipe-cover-photo" type="file" name="" id="" />
						{/if}
					</div>

					<div>
						<h3>Ingredients:</h3>
						<div class="ingredient-list">
							<ul>
								{#each content.ingredients ?? [] as ingredient, iI}
									<li>
										<div class="ingredient">
											<ul>
												<input type="text" bind:value={ingredient} />
											</ul>
											<button
												on:click={() => {
													content.ingredients = [
														...content.ingredients.slice(0, iI),
														...content.ingredients.slice(iI + 1)
													]
												}}>-</button>
										</div>
									</li>
								{/each}
							</ul>
						</div>
						<div class="input-field">
							<input type="text" placeholder="" bind:value={newIngredients[rI]} />
							<button
								on:click={() => {
									addIngredient(rI)
								}}>+</button>
						</div>
					</div>

					<div>
						<h3>Instructions:</h3>
						<ol>
							{#each content.steps ?? [] as step, sI}
								<li>
									<div class="instruction">
										<input type="text" bind:value={step} />
										<button
											on:click={() => {
												content.steps = [
													...content.steps.slice(0, sI),
													...content.steps.slice(sI + 1)
												]
											}}>-</button>
									</div>
								</li>
							{/each}
						</ol>
						<div class="input-field">
							<input type="text" placeholder="" bind:value={newSteps[rI]} />
							<button
								on:click={() => {
									addStep(rI)
								}}>+</button>
						</div>
					</div>

					<div>
						<h3>Times:</h3>
						<div class="time-input">
							<p>Prep Time</p>
							<input type="text" bind:value={content.times.prep} />
						</div>
						<div class="time-input">
							<p>Cook Time</p>
							<input type="text" bind:value={content.times.cook} />
						</div>
						<div class="time-input">
							<p>Total Time</p>
							<input type="text" bind:value={content.times.total} />
						</div>
					</div>
				</div>

				<div>
					<input type="text" placeholder="Servings" bind:value={content.serves} />
					<input type="text" placeholder="Makes: 12in pizza pie" bind:value={content.yield} />
					<input type="text" placeholder="Notes" bind:value={content.notes} />
				</div>
			{/if}
		</div>

		<button
			on:click={() => {
				recipe.content = [...recipe.content.slice(0, rI + 1), '', ...recipe.content.slice(rI + 1)]
			}}>Add Another WriteUp</button>
		<button
			on:click={() => {
				recipe.content = [...recipe.content.slice(0, rI + 1), {}, ...recipe.content.slice(rI + 1)]
			}}>Add Another Recipe Card</button>
	{/each}

	<select name="" id="" bind:value={recipe.visibility}>
		<option value="public">Public</option>
		<option value="unlisted">Unlisted</option>
		<option value="private">Private</option>
	</select>

	<button
		class="btn"
		on:click={() => {
			console.log(recipe)
		}}>Post Recipe</button>
</div>

<style>
	.content {
	}

	.content-card {
		margin-top: 5vh;
		border: #eee solid 3px;
		border-radius: 0.4rem;
		padding: 2rem;
	}

	.recipe-card-input {
	}

	.recipe-header-input {
		display: grid;
		grid-template-columns: 3fr 2fr;
		grid-template-rows: 1fr 1fr;
		gap: 1rem 4rem;
	}

	.recipe-title {
		grid-column: 1;
		grid-row: 1;
	}

	.recipe-description {
		grid-column: 1;
		grid-row: 2;
	}

	.recipe-cover-photo {
		grid-column: 2;
		grid-row: 1 / 3;
	}

	input[type='file'] {
		background-color: #eee;
	}

	input[type='text'] {
		border: none;
		border-bottom: 1px solid #ccc;
		padding: 10px;
		width: 100%;
	}

	input[type='text']:focus {
		outline: none;
		border-bottom: 1px solid #000;
	}

	.input-field {
		position: relative;
		display: flex;
	}

	.input-field button {
		position: absolute;
		right: 0;
		background: none;
		border: none;
	}

	.ingredient-list {
	}

	.ingredient {
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
		flex-direction: row;
		margin-bottom: 1rem;
		list-style: none;
	}

	.time-input {
		display: flex;
		flex-wrap: row;
	}

	.time-input {
	}
</style>
