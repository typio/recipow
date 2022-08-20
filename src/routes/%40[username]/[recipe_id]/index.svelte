<script lang="ts">
	import { goto, invalidate } from '$app/navigation'

	import { session } from '$app/stores'

	import type { Recipe } from '$lib/types'
	import { units } from '$lib/unitData'

	import recipow_fist from '$lib/assets/recipow-fist.svg'
	import recipow_fist_filled from '$lib/assets/recipow-fist-filled.svg'
	import RatingsBar from '$lib/components/recipe/RatingsBar.svelte'
	import TipTapEditor from '$lib/components/editor/TipTapEditor.svelte'

	import tippy from 'sveltejs-tippy'
	import 'tippy.js/animations/perspective.css'
	import 'tippy.js/animations/scale.css'
	import 'tippy.js/dist/border.css'

	export let recipe: Recipe
	export let username: string

	// TODO: check if this user left a review, then show that
	$: rating = recipe.rating || 0

	let commentFormRating = 0
	let commentFormText = ''

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

	const leaveReview = async (event?: { detail: { text: string } }) => {
		// review from top bar
		if (event) {
			const inputRating = JSON.parse(event.detail.text).rating

			const res = await fetch(`/recipe/review`, {
				method: 'POST',
				body: JSON.stringify({
					recipe: `@${username}/${recipe.id}`,
					rating: inputRating,
					comment: ''
				})
			})

			await invalidate(`/@${username}/${recipe.id}`)
			refreshReviews()
		} else {
			// review from comment form

			const res = await fetch(`/recipe/review`, {
				method: 'POST',
				body: JSON.stringify({
					recipe: `@${username}/${recipe.id}`,
					rating: commentFormRating,
					comment: commentFormText
				})
			})

			await invalidate(`/@${username}/${recipe.id}`)
			refreshReviews()
		}
	}

	const getReviews = async (page?: number, offset?: number) => {
		const res = await fetch(
			`/recipe/review/?recipe=${`@${username}/${recipe.id}`}&page=${page}&offset=${offset}&userEmail=${
				$session.user?.email
			}`,
			{ method: 'GET' }
		)
		const data = await res.json()

		return data
	}

	const deleteReview = async () => {
		const res = await fetch(
			`/recipe/review?recipe=${`@${username}/${recipe.id}`}&userEmail=${$session.user?.email}`,
			{ method: 'DELETE' }
		)
		await invalidate(`/@${username}/${recipe.id}`)
		refreshReviews()
	}

	let doGetReviews = getReviews()

	const refreshReviews = async () => {
		doGetReviews = getReviews()
	}

	const intensityHelpTippy = {
		content:
			'Intensity of this recipe<br/>1 - Stick of Butter Coated in Sugar<br/>5 - Boiled Chicken Breast',
		allowHTML: true,
		placement: 'left',
		theme: 'dark',
		animation: 'scale',
		hideOnClick: true
	}

	const reviewCommentHelpTippy = {
		content: 'Formatting options will show<br/> if you highlight your text.',
		allowHTML: true,
		placement: 'left',
		theme: 'dark',
		animation: 'scale',
		hideOnClick: true
	}

	const encourage5FistsTippy = {
		content: "The president votes for himself<br/> Why shouldn't you?",
		allowHTML: true,
		placement: 'left',
		theme: 'dark',
		animation: 'scale',
		hideOnClick: true
	}

	const userLeftReviewHelpTippy = {
		content: 'To replace this review, write a new one.',
		allowHTML: true,
		placement: 'left',
		theme: 'dark',
		animation: 'scale',
		hideOnClick: true
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
		<h2 class="intensity" use:tippy={intensityHelpTippy}>Intensity - {recipe?.intensity}</h2>
		<div class="header-total-time">
			<p>Total Time</p>
			<p class="header-time-value">{getTime(undefined, 'total')}</p>
			<p>Prep</p>
			<p class="header-time-value">{getTime(undefined, 'prep')}</p>
			<p>Cook</p>
			<p class="header-time-value">{getTime(undefined, 'cook')}</p>
		</div>
		<div class="ratings">
			<RatingsBar {rating} on:rating={leaveReview} />
			<p>{recipe.rating ? recipe.rating.toFixed(2) : ''}</p>
			<p>
				{recipe.ratingCount
					? recipe.ratingCount === 1
						? '1 review'
						: recipe.ratingCount + ' reviews'
					: 'no reviews'}
			</p>
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

<div class="review-entry">
	<h2>Leave a Review</h2>
	<div class="ratings-bar-holder">
		<RatingsBar bind:rating={commentFormRating} />
		<p>{commentFormRating.toFixed(2)}</p>
	</div>
	<div use:tippy={reviewCommentHelpTippy}>
		<TipTapEditor placeholder={'Man this is so yummy!'} bind:content={commentFormText} />
	</div>
	<button
		class="btn post-review-btn"
		on:click={() => {
			leaveReview()
			refreshReviews()
		}}>Post</button>
</div>

<div class="reviews">
	{#await doGetReviews}
		<p>Loading reviews...</p>
	{:then reviews}
		{#if reviews.length > 0}
			<h2>Reviews</h2>
		{/if}
		{#each reviews.reviews as review}
			{#if review.leftByUser === true}
				<div class="review user-left-review" use:tippy={userLeftReviewHelpTippy}>
					<img src={review.authorAvatar} alt="" />
					<h3>{@html review.author}</h3>
					<p class="review-date">
						{new Intl.DateTimeFormat('en', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						}).format(new Date(review.date))}
					</p>

					<button
						class="btn btn-danger"
						on:click={() => {
							deleteReview()
						}}>Delete</button>

					<p class="rating">{review.rating} Fists</p>

					<div class="comment">
						{@html review.comment}
					</div>
				</div>
			{:else}
				<div class="review">
					<img src={review.authorAvatar} alt="" />
					<h3>{@html review.author}</h3>
					<p class="review-date">
						{new Intl.DateTimeFormat('en', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						}).format(new Date(review.date))}
					</p>
					<p class="rating">{review.rating} Fists</p>

					<div class="comment">
						{@html review.comment}
					</div>
				</div>
			{/if}
		{/each}
	{:catch error}
		<p>Error loading reviews: {error}</p>
	{/await}
</div>

<style>
	.content {
		display: grid;
		position: relative;
	}

	h1 {
		font-weight: 500;
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
		height: fit-content;
	}

	.header .description {
		grid-column: 1/6;
		position: relative;
		font-weight: 400;
		top: 0px;
	}

	.header-total-time {
		grid-column: 1/8;
		display: flex;

		align-items: center;
	}

	.header-total-time p {
		font-size: 1.2rem;
		line-height: 110%;
		margin: 0 0.3rem 0 0.2rem;
	}

	.header-total-time .header-time-value {
		font-weight: 600;
		margin-right: 2rem;
	}

	.intensity {
		grid-column: 1/6;
		display: flex;
		justify-content: center;
		margin: auto;
		height: fit-content;
		text-align: center;
		width: fit-content;
	}

	.ratings {
		grid-column: 2/6;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		width: 14rem;
	}

	.ratings p {
		margin: 0 0.5rem;
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
		flex-wrap: wrap;
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
		width: 50%;
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

	.review-entry {
	}

	.post-review-btn {
		margin-top: 1rem;
		width: 12%;
		margin-left: 83%;
		min-width: fit-content;
		margin-right: 5%;
	}

	.ratings-bar-holder {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-bottom: 1rem;
		width: 100%;
		justify-content: center;
		align-items: center;
	}

	.reviews {
		margin: 1rem 1rem 1rem 0;
	}

	.review {
		display: grid;
		grid-template-columns: auto auto 1fr;
		grid-template-rows: 2fr 1fr 4fr;
		margin-bottom: 3rem;
		border: 3px solid #eee;
		border-radius: 0.4rem;
		padding: 2rem;
		justify-content: center;
		align-items: center;
	}

	.user-left-review {
		background-color: palegoldenrod;
	}

	.review h3 {
		margin: 0 1rem;
	}

	.review img {
		width: 64px;
		height: 64px;
		object-fit: cover;
		grid-column: 1;
		grid-row: 1/3;
		border-radius: 100%;
	}

	.review .review-date {
		text-align: center;
		margin: 0;
		margin-right: 0.4rem;
		grid-row: 1/3;
	}

	.review .rating {
		grid-column: 2/3;
		grid-row: 2;
		padding-left: 1rem;
		text-align: left;
		margin: 0;
	}

	.review .comment {
		grid-column: 1/5;
		grid-row: 3;
		font-size: 1.25rem;
		margin: 0;
	}
</style>
