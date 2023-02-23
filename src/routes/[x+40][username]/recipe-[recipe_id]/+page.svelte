<script lang="ts">
	import type { PageData } from './$types'

    import {onMount} from 'svelte'

	import { goto, invalidate } from '$app/navigation'
	import { page } from '$app/stores'

	import intensity_1 from '$lib/assets/intensity_1.svg'
	import intensity_2 from '$lib/assets/intensity_2.svg'
	import intensity_3 from '$lib/assets/intensity_3.svg'
	import intensity_4 from '$lib/assets/intensity_4.svg'
	import intensity_5 from '$lib/assets/intensity_5.svg'

	import RatingsBar from '$lib/components/recipe/RatingsBar.svelte'
	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte'

	import type { RecipeCardData } from '$lib/types'

	// TODO: check if this user left a review, then show that
	$: rating = recipe.rating || 0

	let commentFormRating = 0
	let commentFormText = ''

	export let data: PageData

	let { recipe, username } = data
	let user = $page.data.user

	const deleteRecipe = async () => {
		const res = await fetch(`/recipe`, {
			method: 'DELETE',
			body: JSON.stringify({
				recipeId: recipe.id
			})
		})
		const data = await res.json()
		goto('/')
	}

	const getTime = (rI?: number, type?: 'prep' | 'cook' | 'total'): string => {
		let totalTime = [0, 0, 0]
		if (rI === undefined) {
			recipe.content?.forEach((c: RecipeCardData | string) => {
				if (typeof c === 'object') {
					if (type === 'total' || type === undefined) {
						totalTime[0] += (c.times.cook.minutes + c.times.prep.minutes) % 60

						totalTime[1] += (Math.floor((c.times.prep.minutes + c.times.cook.minutes) / 60) + (c.times.prep.hours + c.times.cook.hours)) % 24
						totalTime[2] += Math.floor((Math.floor((c.times.prep.minutes + c.times.cook.minutes) / 60) + (c.times.prep.hours + c.times.cook.hours)) / 24) + (c.times.prep.days + c.times.cook.days)
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
					totalTime[1] += (Math.floor((c.times.prep.minutes + c.times.cook.minutes) / 60) + (c.times.prep.hours + c.times.cook.hours)) % 24
					totalTime[2] += Math.floor((Math.floor((c.times.prep.minutes + c.times.cook.minutes) / 60) + (c.times.prep.hours + c.times.cook.hours)) / 24) + (c.times.prep.days + c.times.cook.days)
				} else {
					totalTime[0] += c.times[type].minutes
					totalTime[1] += c.times[type].hours
					totalTime[2] += c.times[type].days
				}
			}
		}
		return (totalTime[2] > 0 ? totalTime[2] + 'd ' : '') + (totalTime[1] > 0 ? totalTime[1] + 'h ' : '') + (totalTime[0] > 0 ? totalTime[0] + 'm' : '') || '-'
	}

	const leaveReview = async (event?: { detail: { text: string } }) => {
		// review from top bar
		if (event) {
			const inputRating = JSON.parse(event.detail.text).rating

			const res = await fetch(`/recipe/review`, {
				method: 'POST',
				body: JSON.stringify({
					recipe: `@${username}/recipe-${recipe.id}`,
					rating: inputRating,
					comment: ''
				})
			})
			refreshReviews()
			const res2 = await fetch(`/recipe?type=one&username=${username}&id=${recipe.id}`, {
				method: 'GET'
			})

			recipe = (await res2.json()).recipe
		} else {
			// review from comment form

			const res = await fetch(`/recipe/review`, {
				method: 'POST',
				body: JSON.stringify({
					recipe: `@${username}/recipe-${recipe.id}`,
					rating: commentFormRating,
					comment: commentFormText
				})
			})

			refreshReviews()

			const res2 = await fetch(`/recipe?type=one&username=${username}&id=${recipe.id}`, {
				method: 'GET'
			})

			recipe = (await res2.json()).recipe
		}
	}

	const getReviews = async (page?: number, offset?: number) => {
		const res = await fetch(`/recipe/review/?recipe=${`@${username}/${recipe.id}`}&page=${page}&offset=${offset}&userEmail=${user?.email}`, { method: 'GET' })
		const data = await res.json()

		return data
	}

	const deleteReview = async () => {
		const res = await fetch(`/recipe/review?recipe=${`@${username}/${recipe.id}`}&userEmail=${user?.email}`, { method: 'DELETE' })
		await invalidate(`/@${username}/${recipe.id}`)
		refreshReviews()
	}

    let doGetReviews: Promise<any>;

    onMount(()=> {
	    doGetReviews = getReviews()
    })

	const refreshReviews = async () => {
		doGetReviews = getReviews()
	}
</script>

<svelte:head>
	<title>{recipe.title}</title>
	<meta name="description" content={recipe.description} />
	<meta name="author" content={'@' + username} />
</svelte:head>

<div class="content mx-4">
	<div class="header bg-white dark:bg-stone-800 shadow-md rounded-xl p-4">
        <div class="lg:flex">
            <div class="lg:my-auto mx-auto">
                <h1 class="title font-bold text-3xl text-center text-stone-800 dark:text-stone-200">{recipe.title}</h1>
                <h2 class="description text-sm lg:text-md text-center mb-4">{recipe.description}</h2>
            </div>
            <img class="ml-auto mr-0" src={recipe.cover_image} alt="" />
        </div>
        <div class="ratings flex flex-col mt-4" >
            <div class="mx-auto">
            <RatingsBar {rating} on:rating={leaveReview} />
            </div>
            <div class="flex flex-row mx-auto">
            {#if recipe.rating}
                <p class="mr-4">{recipe.rating.toFixed(1) + ' fists'}</p>
            {/if}
            <p>
                {recipe.ratingCount ? (recipe.ratingCount === 1 ? '1 review' : recipe.ratingCount + ' reviews') : 'no reviews'}
            </p>
            </div>
        </div>
        <div class="flex flex-row mt-2 max-w-md mx-auto">
            <div class="">
                <div class="flex flex-row">
                    <p>Total Time</p>
                    <p class="pl-2 font-semibold">{getTime(undefined, 'total')}</p>
                </div>
                <div class="flex flex-row ">
                    <div class="flex flex-row ">
                        <p>Prep</p>
                        <p class="pl-2 font-semibold">{getTime(undefined, 'prep')}</p>
                    </div>
                    <div class="flex flex-row pl-4">
                        <p>Cook</p>
                        <p class="pl-2 font-semibold">{getTime(undefined, 'cook')}</p>
                    </div>
                </div>
            </div>
            <div class="ml-auto mr-0 my-auto flex flex-row items-center h-8" >
                <h2 class="leading-8">Intensity:</h2>
                {#if recipe.intensity == 1}
                    <img class="ml-2 h-8" src={intensity_1} alt="" />
                {:else if recipe.intensity == 2}
                    <img class="ml-2 h-8" src={intensity_2} alt="" />
                {:else if recipe.intensity == 3}
                    <img class="ml-2 h-8" src={intensity_3} alt="" />
                {:else if recipe.intensity == 4}
                    <img class="ml-2 h-8" src={intensity_4} alt="" />
                {:else}
                    <img class="ml-2 h-8" src={intensity_5} alt="" />
                {/if}
            </div>
        </div>
		<div>
			<ul class="flex flex-row mt-2 lg:mt-4 overflow-x-auto max-w-md mx-auto">
				{#each recipe.tags || [] as tag}
					<li class="w-fit whitespace-nowrap font-semibold text-sm leading-4 px-3 py-1 mr-2 bg-stone-500 text-stone-50 dark:bg-stone-600 dark:text-stone-100 rounded-full">{tag}</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="details my-4">
		{#if user?.username === username}
			<button class="bg-red-600 text-stone-50 font-semibold rounded-lg h-10 px-4" on:click={deleteRecipe}>Delete Recipe</button>
		{:else}
			Written by <a href="/@{username}">{'@' + username}</a>
		{/if}
	</div>

	{#each recipe.content as content, rI}
		<div class="content-card bg-white dark:bg-stone-800 shadow-md rounded-xl p-4 mb-6">
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
												{ingredient.preperation ?? ''}
											</h5>

											<h4 class="ingredient-amount">
												{ingredient?.amount + '' + (ingredient?.amount == 1 ? ingredient?.unit?.abbr[0] ?? '' : ingredient?.unit?.abbr[1] ?? '')}
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

						<ul class="instruction-list">
							{#each content.steps ?? [] as step, sI}
								<li class="instruction">
									<div class="instruction-number">{sI + 1}</div>
									<div class="instruction-text rendered-tiptap">
										{@html step}
									</div>
								</li>
							{/each}
						</ul>
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

<div class="w-full mx-4 my-12">
	<h2 class="font-semibold text-lg">Leave a Review</h2>
    <div class="flex flex-col mt-2 text-center place-items-center place-content-center" >
        <RatingsBar bind:rating={commentFormRating} />
        <p>{commentFormRating < 4.8 ? commentFormRating.toFixed(1) : 5}</p>
    </div>
	<TipTapEditor placeholder="Man this is so yummy!" bind:content={commentFormText} />
	<button
		class="flex ml-auto mr-4 mt-2 rounded-lg leading-10 font-semibold bg-stone-200 text-stone-700 h-10 px-6"
		on:click={() => {
			leaveReview()
			refreshReviews()
		}}>Post</button>
</div>

<div class="reviews mx-4">
    {#if doGetReviews !== undefined}
	{#await doGetReviews}
		<p>Loading reviews...</p>
	{:then reviews}
		{#if reviews?.length > 0}
			<h2>Reviews</h2>
		{/if}
		{#each reviews.reviews as review}
			{#if review.leftByUser === true}
				<div class="review user-left-review mb-8" >
                    <div class="flex">
                        <img class="rounded-full w-12 h-12" src={review.authorAvatar} alt="" />
                        <div class="flex ml-4 flex-col">
                            <h3 class="font-semibold">{@html review.author}</h3>
                            <p class="review-date">
                                {new Intl.DateTimeFormat('en', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }).format(new Date(review.date))}
                            </p>
                        </div>
                        <div class="ml-auto mr-2">
                            <p class="rating font-semibold text-center">{review.rating} Fists</p>
                            <button
                                class="bg-red-600 text-stone-50 font-semibold rounded-lg h-10 px-4 mt-1"
                                on:click={() => {
                                    deleteReview()
                                }}>Delete
                            </button>
                        </div>
                    </div>

                    {#if review.comment.replaceAll(/(<([^>]+)>)/gi, '') !== ''}
                        <div class="comment ">
                            {@html review.comment}
                        </div>
                    {/if}
                </div>
			{:else}
				<div class="review  mb-8">
                    <div class="flex">
                        <img class="rounded-full w-12 h-12" src={review.authorAvatar} alt="" />
                        <div class="flex ml-4 flex-col">
                            <h3 class="font-semibold">{@html review.author}</h3>
                            <p class="review-date">
                                {new Intl.DateTimeFormat('en', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }).format(new Date(review.date))}
                            </p>
                        </div>
                        <p class="rating ml-auto mr-4 font-semibold">{review.rating} Fists</p>
                    </div>
					{#if review.comment.replaceAll(/(<([^>]+)>)/gi, '') !== ''}
						<div class="comment mt-2">
							{@html review.comment}
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	{:catch error}
		<p>Error loading reviews: {error}</p>
	{/await}
    {/if}
</div>
