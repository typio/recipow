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
	import { browser } from '$app/env'
	import tippy from 'sveltejs-tippy'
	import 'tippy.js/animations/perspective.css'
	import 'tippy.js/animations/scale.css'
	import 'tippy.js/dist/border.css'

	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte'

	import type { RecipeCardData, Recipe, Ingredient } from '$lib/types'
	import { units } from '$lib/unitData'

	let recipeCardTemplate = {
		ingredients: [],
		steps: [],
		times: {
			prep: { minutes: 0, hours: 0, days: 0 },
			cook: { minutes: 0, hours: 0, days: 0 }
		},
		yield: '',
		nutrition: {}
	} as RecipeCardData

	let recipeTemplate: Recipe = {
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

	let ingredientTemplate: Ingredient = {
		name: '',
		amount: 0,
		unit: units[0],
		preperation: ''
	}

	let recipe: Recipe

	recipe = recipeTemplate

	if (browser) {
		if (localStorage.getItem('recipe') !== '' && localStorage.getItem('recipe') !== null) {
			recipe = JSON.parse(localStorage.getItem('recipe') || '')
		}
	}

	let newIngredients: Ingredient[] = [
		{} as Ingredient,
		{
			name: '',
			amount: 0,
			unit: units[0],
			preperation: ''
		}
	]

	let newSteps: string[] = ['', '']

	const addIngredient = (rI: number) => {
		if (typeof recipe.content[rI] === 'object') {
			recipe.content[rI].ingredients = [...recipe.content[rI].ingredients, newIngredients[rI]]
			newIngredients[rI] = {} as Ingredient
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

	const writeUpHelpTippy = {
		content:
			'This is an optional section<br/> where you can tell the readers<br/> more about your recipe.<br/><br/>Formatting options will show<br/> if you highlight the text.',
		allowHTML: true,
		placement: 'left',
		theme: 'dark',
		animation: 'scale',
		hideOnClick: true
	}

	const nutritionHelpTippy = {
		content: "Leave these empty and they <br/>won't appear on the recipe.",
		allowHTML: true,
		placement: 'left',
		theme: 'dark',
		animation: 'scale',
		hideOnClick: true
	}

	const notesHelpTippy = {
		content:
			"Leave this empty and it <br/>won't appear on the recipe.<br/><br/>Formatting options will show<br/> if you highlight the text.",
		allowHTML: true,
		placement: 'left',
		theme: 'dark',
		animation: 'scale',
		hideOnClick: true
	}
</script>

<svelte:head>
	<title>New Recipe</title>
</svelte:head>

<svelte:window
	on:keydown={() => {
		console.log(recipe)

		localStorage.setItem('recipe', JSON.stringify(recipe))
	}} />

<div class="content">
	<div class="recipe-header-input">
		<input class="recipe-title" type="text" placeholder="Recipe Title" bind:value={recipe.title} />
		<input
			class="recipe-description"
			type="text"
			placeholder="Description"
			bind:value={recipe.description} />
		<img class="recipe-cover-preview" src={recipe.cover_image} alt="" />
		<input
			class="recipe-cover-input"
			type="file"
			name=""
			id=""
			on:change={async e => {
				const reader = new FileReader()

				reader.readAsDataURL(e.target.files[0])
				reader.onload = async e => {
					recipe.cover_image = e.target.result

					const res = await fetch('/api/uploadImage', {
						method: 'POST',
						body: JSON.stringify({
							bucketName: 'recipe_imgs',
							imageBase64: recipe.cover_image,
							isTemp: true
						})
					})

					const data = await res.json()
					recipe.cover_image = data.imageUrl
				}
			}} />
	</div>

	<div class="insert-content-toolbar">
		<button
			class="btn"
			on:click={() => {
				if (recipe.content.length < 6) {
					recipe.content = ['', ...recipe.content]
					newSteps = ['', ...newSteps]
					newIngredients = [Object.assign({}, ingredientTemplate), ...newIngredients]
				} else {
					toast.push(`<h4>You can\'t have more than 6 cards sorry.</h4>`)
				}
			}}>Add Another WriteUp</button>
		<div class="toolbar-divider" />
		<button
			class="btn"
			on:click={() => {
				if (recipe.content.length < 6) {
					recipe.content = [Object.assign({}, recipeCardTemplate), ...recipe.content]
					newSteps = ['', ...newSteps]
					newIngredients = [Object.assign({}, ingredientTemplate), ...newIngredients]
				} else {
					toast.push(`<h4>You can\'t have more than 6 cards sorry.</h4>`)
				}
			}}>Add Another Recipe Card</button>
	</div>

	{#each recipe.content as content, rI}
		<div class="content-card" id={rI.toString()}>
			{#if typeof content === 'string'}
				<div class="write-up" use:tippy={writeUpHelpTippy}>
					<div class="write-up-header">
						<h3>Write Up:</h3>
						<button
							class="btn btn-danger remove-btn"
							on:click={() => {
								newIngredients = [...newIngredients.slice(0, rI), ...newIngredients.slice(rI + 1)]
								newSteps = [...newSteps.slice(0, rI), ...newSteps.slice(rI + 1)]
								recipe.content = [...recipe.content.slice(0, rI), ...recipe.content.slice(rI + 1)]
							}}>Remove</button>
					</div>
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
							<img class="recipe-cover-preview" src={content.cover_image} alt="" />
							<input
								class="recipe-cover-input"
								type="file"
								name=""
								id=""
								on:change={async e => {
									const reader = new FileReader()
									reader.readAsDataURL(e.target?.files[0])
									reader.onload = async e => {
										content.cover_image = e.target.result

										const res = await fetch('/api/uploadImage', {
											method: 'POST',
											body: JSON.stringify({
												bucketName: 'recipe_imgs',
												imageBase64: content.cover_image,
												isTemp: true
											})
										})

										const data = await res.json()
										content.cover_image = data.imageUrl
									}
								}} />
							{#if [...recipe.content.slice(0, rI), ...recipe.content.slice(rI + 1)].find(e => typeof e === 'object') !== undefined}
								<button
									class="btn btn-danger remove-btn"
									on:click={() => {
										recipe.content = [
											...recipe.content.slice(0, rI),
											...recipe.content.slice(rI + 1)
										]

										newIngredients = [
											...newIngredients.slice(0, rI),
											...newIngredients.slice(rI + 1)
										]

										newSteps = [...newSteps.slice(0, rI), ...newSteps.slice(rI + 1)]
									}}>Remove</button>
							{/if}
						{/if}
					</div>

					<div>
						<h3>Ingredients:</h3>
						<div class="ingredient-list">
							<ul>
								{#each content.ingredients ?? [] as ingredient, iI}
									<li>
										<div class="ingredient">
											<input
												class="ingredient-name"
												type="text"
												placeholder="ex. Salted Butter"
												bind:value={ingredient.name} />

											<input
												class="ingredient-amount"
												type="number"
												placeholder=""
												bind:value={ingredient.amount} />
											<select class="ingredient-unit" name="" id="" bind:value={ingredient.unit}>
												{#each units as unit, i}
													<option value={unit}>{unit.name[0]}</option>
												{/each}
											</select>
											<input
												class="ingredient-preperation"
												type="text"
												placeholder="ex. Softened"
												bind:value={ingredient.preperation} />

											<button
												class="ingredient-btn btn"
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
						<div class="input-field ingredient">
							<input
								class="ingredient-name"
								type="text"
								placeholder="ex. Salted Butter"
								bind:value={newIngredients[rI].name} />

							<input
								class="ingredient-amount"
								type="number"
								placeholder=""
								bind:value={newIngredients[rI].amount} />
							<select class="ingredient-unit" name="" id="" bind:value={newIngredients[rI].unit}>
								{#each units as unit, i}
									<option value={unit}>{unit.name[0]}</option>
								{/each}
							</select>
							<input
								class="ingredient-preperation"
								type="text"
								placeholder="ex. Softened"
								bind:value={newIngredients[rI].preperation} />
							<button
								class="ingredient-btn btn"
								on:click={() => {
									addIngredient(rI)
								}}>+</button>
						</div>
					</div>

					<div class="nutrition" use:tippy={nutritionHelpTippy}>
						<li>
							<input
								class="nutrition-amount"
								on:change={() => {
									content.nutrition.calories = content.nutrition.calories?.replace(/[^0-9.]/g, '')
								}}
								bind:value={content.nutrition.calories} />
							<div class="nutrition-label">Calories</div>
						</li>
						<li>
							<input
								class="nutrition-amount"
								on:change={() => {
									content.nutrition.protein = content.nutrition.protein?.replace(/[^0-9.]/g, '')
									content.nutrition.protein ? (content.nutrition.protein += 'g') : null
								}}
								bind:value={content.nutrition.protein} />
							<div class="nutrition-label">Protein</div>
						</li>
						<li>
							<input
								class="nutrition-amount"
								on:change={() => {
									content.nutrition.fat = content.nutrition.fat?.replace(/[^0-9.]/g, '')
									content.nutrition.fat ? (content.nutrition.fat += 'g') : null
								}}
								bind:value={content.nutrition.fat} />
							<div class="nutrition-label">Fat</div>
						</li>
						<li>
							<input
								class="nutrition-amount"
								on:change={() => {
									content.nutrition.carbs = content.nutrition.carbs?.replace(/[^0-9.]/g, '')
									content.nutrition.carbs ? (content.nutrition.carbs += 'g') : null
								}}
								bind:value={content.nutrition.carbs} />
							<div class="nutrition-label">Carbs</div>
						</li>
						<li>
							<input
								class="nutrition-amount"
								on:change={() => {
									content.nutrition.fiber = content.nutrition.fiber?.replace(/[^0-9.]/g, '')
									content.nutrition.fiber ? (content.nutrition.fiber += 'g') : null
								}}
								bind:value={content.nutrition.fiber} />
							<div class="nutrition-label">Fiber</div>
						</li>
						<li>
							<input
								class="nutrition-amount"
								on:change={() => {
									content.nutrition.sugar = content.nutrition.sugar?.replace(/[^0-9.]/g, '')
									content.nutrition.sugar ? (content.nutrition.sugar += 'g') : null
								}}
								bind:value={content.nutrition.sugar} />
							<div class="nutrition-label">Sugar</div>
						</li>
					</div>

					<div class="instructions">
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
							<span style="width:80%;">
								<TipTapEditor
									bind:content={newSteps[rI]}
									mode="generic"
									placeholder="Write a step..." />
							</span>
							<button
								class="btn"
								on:click={() => {
									addStep(rI)
								}}>+</button>
						</div>
					</div>

					<h3>Times:</h3>
					<div class="times">
						<div class="time-input">
							<h4>Prep Time</h4>
							<input type="number" bind:value={content.times.prep.minutes} min="0" max="59" />
							<p class="time-unit">mins</p>
							<input type="number" bind:value={content.times.prep.hours} min="0" max="23" />
							<p class="time-unit">hours</p>
							<input type="number" bind:value={content.times.prep.days} min="0" max="999" />
							<p class="time-unit">days</p>
						</div>
						<div class="time-input">
							<h4>Cook Time</h4>
							<input type="number" bind:value={content.times.cook.minutes} min="0" max="59" />
							<p class="time-unit">mins</p>
							<input type="number" bind:value={content.times.cook.hours} min="0" max="23" />
							<p class="time-unit">hours</p>
							<input type="number" bind:value={content.times.cook.days} min="0" max="999" />
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
							<input type="text" placeholder="ex. 1" bind:value={content.serves} />
						</div>
						<div class="row">
							<h3>Yield</h3>
							<input type="text" placeholder="ex. one 18in pizza pie" bind:value={content.yield} />
						</div>
						<div use:tippy={notesHelpTippy}>
							<h3>Notes:</h3>
							<TipTapEditor
								bind:content={content.notes}
								mode="generic"
								placeholder="Write any notes..." />
						</div>
					</div>
				</div>
			{/if}
		</div>

		<div class="insert-content-toolbar">
			<button
				class="btn"
				on:click={() => {
					if (recipe.content.length < 6) {
						document
							.getElementById((rI + 1)?.toString())
							?.scrollIntoView({ behavior: 'smooth', block: 'center' })

						recipe.content = [
							...recipe.content.slice(0, rI + 1),
							'',
							...recipe.content.slice(rI + 1)
						]
						newSteps = ['', ...newSteps]
						newIngredients = [Object.assign({}, ingredientTemplate), ...newIngredients]
					} else {
						toast.push(`<h4>You can\'t have more than 6 cards sorry.</h4>`)
					}
				}}>Add Another WriteUp</button>
			<div class="toolbar-divider" />
			<button
				class="btn"
				on:click={() => {
					if (recipe.content.length < 6) {
						document
							.getElementById((rI + 1)?.toString())
							?.scrollIntoView({ behavior: 'smooth', block: 'start' })

						recipe.content = [
							...recipe.content.slice(0, rI + 1),
							Object.assign({}, recipeCardTemplate),
							...recipe.content.slice(rI + 1)
						]

						newSteps = ['', ...newSteps]
						newIngredients = [Object.assign({}, ingredientTemplate), ...newIngredients]
					} else {
						toast.push(`<h4>You can\'t have more than 6 cards sorry.</h4>`)
					}
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
			localStorage.removeItem('recipe')
			postRecipe()
			console.log(recipe)
		}}>Post Recipe</button>
</div>

<style>
	.row {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		align-content: center;
	}

	.row h3 {
		margin: 1rem 1rem 1rem 0;
	}

	.content {
		position: relative;
	}

	.content-card {
		border: 3px solid #eee;
		border-radius: 0.4rem;
	}

	.write-up-header {
		padding: 1rem 4rem 0 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.write-up hr {
		margin: 0;
	}

	.recipe-card-input {
		padding: 2rem;
	}

	.recipe-header-input {
		display: grid;
		grid-template-columns: 2fr 3fr;
		grid-template-rows: 1fr 1fr;
		gap: 1rem 1rem;
	}

	.recipe-card-input > .recipe-header-input {
		display: grid;
		grid-template-columns: 2fr 3fr 1fr;
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

	.recipe-cover-input {
		grid-column: 2;
		grid-row: 1/2;
	}

	.recipe-cover-preview {
		grid-column: 2;
		grid-row: 1/2;
		max-height: 18rem;
		margin-bottom: 3rem;
	}

	.recipe-header-input button {
		grid-column: 3;
		grid-row: 1/3;
		margin: auto;
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
		border: none;
	}

	.nutrition-amount:focus {
		outline: 3px solid lightskyblue;
	}

	.nutrition-label {
		color: #fff;
		margin-top: 0.5rem;
	}

	.instructions {
		margin: 2rem 0;
	}

	.instruction {
		display: flex;
	}

	.instruction:nth-child(1) {
		color: red;
	}

	input[type='file'] {
		margin-top: auto;
		height: 2rem;
	}

	input[type='text'] {
		border: none;
		border-bottom: 1px solid #ccc;
		width: max-content;
	}

	input[type='text']:focus {
		outline: none;
		border-bottom: 1px solid #000;
	}

	.input-field {
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.input-field input {
	}

	.ingredient-list ul {
		list-style: none;
		padding: 0;
	}

	.ingredient {
		display: grid;
		width: 100%;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-template-rows: 1fr 1fr;
	}

	.ingredient-name {
		grid-column: 1;
		grid-row: 1;
		font-size: 1.25rem;
	}

	.ingredient-preperation {
		grid-column: 1;
		grid-row: 2;
		font-size: 0.875rem;
	}

	.ingredient-preperation {
		padding: 0;
	}

	.ingredient-amount {
		grid-column: 2;
		grid-row: 1/3;
	}

	.ingredient-unit {
		grid-column: 3;
		grid-row: 1/3;
	}

	.ingredient-btn {
		grid-column: 4;
		grid-row: 1/3;
	}

	.times {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr 1fr 1fr;
		gap: 1rem 4rem;
		margin: 1rem 0;
	}

	.time-input {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr 2fr 1fr 2fr 1fr;
		grid-template-rows: 1fr;
		/* gap: 1rem 4rem; */
	}

	.time-input > input,
	.time-input > .time-total-number {
		text-align: right;
	}

	.time-input > .time-unit {
		padding: 0 2rem 0 1rem;
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
		width: 18%;
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
		margin-left: 19%;
		width: 62%;

		transition: width 0.1s ease-in-out, margin-left 0.1s ease-in-out;
	}
</style>
