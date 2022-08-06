<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'
	// if not logged in redirect to home page
	export const load: Load = async ({ session }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/'
			}
		} else {
			return {
				status: 200
			}
		}
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation'
	import { toast } from '@zerodevx/svelte-toast'

	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte'

	import type { RecipeCardData, Recipe } from '$lib/types'

	let recipeCardTemplate = {
		ingredients: [],
		steps: [],
		times: {
			prep: { minutes: 0, hours: 0, days: 0 },
			cook: { minutes: 0, hours: 0, days: 0 }
		},
		yield: ''
	} as RecipeCardData

	let recipe: Recipe = {
		id: '',
		title: '',
		description: '',
		content: ['', Object.assign({}, recipeCardTemplate)],
		tags: [],
		reviews: {
			rating: 0,
			reviewCount: 0
		},
		visibility: 'public'
	}

	let newIngredients: string[] = []
	let newSteps: string[] = []

	const addIngredient = (rI: number) => {
		if (typeof recipe.content[rI] === 'object') {
			recipe.content[rI].ingredients = [...recipe.content[rI].ingredients, newIngredients[rI]]
			newIngredients[rI] = ''
		}
	}

	const addStep = (rI: number) => {
		if (typeof recipe.content[rI] === 'object') {
			recipe.content[rI].steps = [...recipe.content[rI].steps, newSteps[rI]]
			newSteps[rI] = ''
		}
	}

	const postRecipe = async () => {
		toast.push(`<h4>Uploading Recipe...</h4>`)
		const res = await fetch('/recipe', {
			method: 'POST',
			body: JSON.stringify({
				recipe
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})

		if (res.status === 200) {
			toast.pop()
			const out = await res.json()
			goto(out.url)
		} else {
			toast.pop()
			const out = await res.json()
			toast.push(`<h4>${out.message}</h4>`)
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

	<div class="insert-content-toolbar">
		<button
			class="btn"
			on:click={() => {
				recipe.content = ['', ...recipe.content]
			}}>Add Another WriteUp</button>
		<div class="toolbar-divider" />
		<button
			class="btn"
			on:click={() => {
				recipe.content = [Object.assign({}, recipeCardTemplate), ...recipe.content]
			}}>Add Another Recipe Card</button>
	</div>

	{#each recipe.content as content, rI}
		<div class="content-card ">
			{#if [...recipe.content.slice(0, rI), ...recipe.content.slice(rI + 1)].find(e => typeof e === 'object') !== undefined}
				<button
					class="btn btn-danger remove-btn"
					on:click={() => {
						recipe.content = [...recipe.content.slice(0, rI), ...recipe.content.slice(rI + 1)]
					}}>Remove</button>
			{/if}
			{#if typeof content === 'string'}
				<div class="write-up">
					<h3>Write Up:</h3>
					<hr />
					<TipTapEditor bind:content mode="writeup" placeholder="Write something..." />
				</div>
			{:else if typeof content === 'object'}
				<div class="recipe-card-input">
					<div class="recipe-header-input">
						{#if recipe.content.filter(el => typeof el === 'object').length > 1}
							<input
								class="recipe-title"
								type="text"
								placeholder="Recipe Title"
								bind:value={content.title} />
							<input
								class="recipe-description"
								type="text"
								placeholder="Description"
								bind:value={content.description} />
							<input
								class="recipe-cover-photo"
								type="file"
								name=""
								id=""
								bind:value={content.cover_image_url} />
						{/if}
					</div>

					<div>
						<h3>Ingredients:</h3>
						<div class="ingredient-list">
							<ul>
								{#each content.ingredients ?? [] as ingredient, iI}
									<li>
										<div class="ingredient">
											<input type="text" bind:value={ingredient} />

											<button
												class="btn"
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
							<input
								type="text"
								placeholder="ex. 30 grams of Whey Protein"
								bind:value={newIngredients[rI]} />
							<button
								class="btn"
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
										<TipTapEditor bind:content={step} mode="generic" />
										<button
											class="btn"
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
							<TipTapEditor
								bind:content={newSteps[rI]}
								mode="generic"
								placeholder="Write a step..." />
							<button
								class="btn"
								on:click={() => {
									addStep(rI)
								}}>+</button>
						</div>
					</div>

					<div>
						<h3>Times:</h3>
						<div class="time-input">
							<h4>Prep Time</h4>
							<input type="number" bind:value={content.times.prep.minutes} min="0" max="59" />
							<p>mins</p>
							<input type="number" bind:value={content.times.prep.hours} min="0" max="23" />
							<p>hours</p>
							<input type="number" bind:value={content.times.prep.days} min="0" />
							<p>days</p>
						</div>
						<div class="time-input">
							<h4>Cook Time</h4>
							<input type="number" bind:value={content.times.cook.minutes} min="0" max="59" />
							<p>mins</p>
							<input type="number" bind:value={content.times.cook.hours} min="0" max="23" />
							<p>hours</p>
							<input type="number" bind:value={content.times.cook.days} min="0" />
							<p>days</p>
						</div>
						<div class="time-input">
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
						<input type="text" placeholder="ex. 3-4" bind:value={content.serves} />
						<h3>Yield</h3>
						<input type="text" placeholder="ex. one 18in pizza pie" bind:value={content.yield} />
						<h3>Notes</h3>
						<TipTapEditor
							bind:content={content.notes}
							mode="generic"
							placeholder="Write any notes..." />
					</div>
				</div>
			{/if}
		</div>

		<div class="insert-content-toolbar">
			<button
				class="btn"
				on:click={() => {
					recipe.content = [...recipe.content.slice(0, rI + 1), '', ...recipe.content.slice(rI + 1)]
				}}>Add Another WriteUp</button>
			<div class="toolbar-divider" />
			<button
				class="btn"
				on:click={() => {
					recipe.content = [
						...recipe.content.slice(0, rI + 1),
						Object.assign({}, recipeCardTemplate),
						...recipe.content.slice(rI + 1)
					]
				}}>Add Another Recipe Card</button>
		</div>
	{/each}

	<select name="" id="" bind:value={recipe.visibility}>
		<option value="public">Public</option>
		<option value="unlisted">Unlisted</option>
		<option value="private">Private</option>
	</select>

	<button
		class="btn"
		on:click={() => {
			postRecipe()

			console.log(recipe)
		}}>Post Recipe</button>
</div>

<style>
	.content {
		position: relative;
	}

	.content-card {
		border: #eee solid 3px;
		border-radius: 0.4rem;
	}

	.write-up hr {
		margin-bottom: 0;
	}

	.recipe-card-input {
		padding: 2rem;
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

	.remove-btn {
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
		display: flex;
		align-items: space-around;
	}

	.input-field > button {
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

	.time-input {
		display: flex;
		flex-wrap: row;
	}

	.time-input {
	}

	.insert-content-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 4rem;
		width: 100%;
	}

	.insert-content-toolbar button {
		opacity: 0;
		width: 14%;
		transition: opacity 0.1s ease-in-out;
	}

	.insert-content-toolbar:hover button {
		opacity: 100;
		transition-property: opacity;
		transition: opacity 0.1s ease-in-out;
		transition-delay: 0.1s;
	}

	.insert-content-toolbar .toolbar-divider {
		position: absolute;
		height: 3px;
		width: 100%;
		background-color: #000;
		transition: width 0.1s ease-in-out, margin-left 0.1s ease-in-out;
		transition-delay: 0.1s;
	}

	.insert-content-toolbar:hover .toolbar-divider {
		margin-left: 15%;
		width: 70%;

		transition: width 0.1s ease-in-out, margin-left 0.1s ease-in-out;
	}
</style>
