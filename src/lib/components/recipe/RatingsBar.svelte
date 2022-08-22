<script lang="ts">
	import { onMount } from 'svelte'

	import recipow_fist_filled from '$lib/assets/recipow-fist-filled.svg'
	import recipow_fist_empty from '$lib/assets/recipow-fist-empty.svg'

	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let rating = 0
	let tempRating = rating

	let firstFist: Element
	let secondFist: Element

	let randomPart = Math.floor(Math.random() * 1000000)

	onMount(async () => {
		firstFist = document.getElementsByClassName('rating-1-' + randomPart)[0]
		secondFist = document.getElementsByClassName('rating-2-' + randomPart)[0]
	})

	const dispatchRating = () => {
		dispatch('rating', {
			text: JSON.stringify({
				rating: parseFloat(rating.toFixed(2))
			})
		})
	}
</script>

<div
	class="ratings-bar"
	on:mousemove={e => {
		const firstFistX = firstFist.getBoundingClientRect().x
		const fistWidth = firstFist.getBoundingClientRect().width
		const fistSpacing =
			secondFist.getBoundingClientRect().left - firstFist.getBoundingClientRect().right

		let mouseX = e.clientX
		if (mouseX < firstFistX + (fistWidth + fistSpacing) * 5 - fistSpacing) {
			// check if over fist (to avoid setting on offset part)
			if (
				((mouseX - firstFistX) / (fistWidth + fistSpacing)) % 1 <
				fistWidth / (fistWidth + fistSpacing)
			)
				tempRating =
					(mouseX -
						firstFistX -
						fistSpacing * Math.floor((mouseX - firstFistX) / (fistWidth + fistSpacing))) /
					fistWidth
		} else {
			tempRating = rating
		}
	}}
	on:mouseleave={() => {
		tempRating = rating
	}}
	on:mousedown={() => {
		rating = tempRating
		dispatchRating()
	}}>
	{#each [1, 2, 3, 4, 5] as ratingLevel, i}
		<img
			class="rating-{ratingLevel}-{randomPart}"
			style="margin-left: {i * 3}rem"
			src={recipow_fist_empty}
			alt="Rating Fist" />
		{#if ratingLevel <= tempRating}
			<img style="margin-left: {i * 3}rem" src={recipow_fist_filled} alt="Rating Fist" />
		{:else if ratingLevel - 1 <= tempRating}
			<img
				style=" margin-left: {i * 3}rem; width: {(tempRating % 1) * 2}rem"
				src={recipow_fist_filled}
				alt="Rating Fist" />
		{/if}
	{/each}
</div>

<style>
	.ratings-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 15rem;
		height: 3rem;
	}

	.ratings-bar img {
		object-fit: cover;
		object-position: 0% 0;
		position: absolute;
		width: 2rem;
		height: 2rem;
	}
</style>
