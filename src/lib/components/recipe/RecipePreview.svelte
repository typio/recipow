<script lang="ts">
	import { goto } from '$app/navigation'

	import tippy from 'sveltejs-tippy'
	import 'tippy.js/animations/perspective.css'
	import 'tippy.js/animations/scale.css'
	import 'tippy.js/dist/border.css'

	import intensity_1 from '$lib/assets/intensity_1.svg'
	import intensity_2 from '$lib/assets/intensity_2.svg'
	import intensity_3 from '$lib/assets/intensity_3.svg'
	import intensity_4 from '$lib/assets/intensity_4.svg'
	import intensity_5 from '$lib/assets/intensity_5.svg'

	import type { Recipe } from '$lib/types'
	import RatingsBar from './RatingsBar.svelte'
	export let recipe: Recipe
	export let link: string

	const intensityHelpTippy = {
		content:
			'Intensity of this recipe<br/>\
			1 - Stick of Butter Coated in Sugar<br/>\
			2 - Oatmeal w/ Fruit<br/>\
			3 - Oatmeal w/ Peanut Butter<br/>\
			4 - Oatmeal w/ Whey Protein<br/>\
			5 - Boiled Chicken Breast',
		allowHTML: true,
		placement: 'left',
		theme: 'poptart',
		animation: 'scale',
		hideOnClick: true
	}
</script>

<div class="preview">
	<div class="intensity" use:tippy={intensityHelpTippy}>
		{#if recipe?.intensity == 1}
			<img src={intensity_1} alt="" />
		{:else if recipe?.intensity == 2}
			<img src={intensity_2} alt="" />
		{:else if recipe?.intensity == 3}
			<img src={intensity_3} alt="" />
		{:else if recipe?.intensity == 4}
			<img src={intensity_4} alt="" />
		{:else}
			<img src={intensity_5} alt="" />
		{/if}
	</div>

	<div
		class="cover_image"
		on:click={() => {
			goto(link)
		}}>
		<img src={recipe.cover_image} alt="" />
	</div>

	<div class="preview-body">
		<h3
			on:click={() => {
				goto(link)
			}}>
			{recipe.title}
		</h3>

		<div class="row">
			<RatingsBar active={false} rating={recipe.rating} />
			<p class="rating-count">{recipe.ratingCount}</p>
		</div>
		<p
			class="description"
			on:click={() => {
				goto(link)
			}}>
			{recipe.description}
		</p>
		<div class="bottom-row">
			<ul>
				{#each recipe?.tags || [] as tag}
					<li>{tag}</li>
				{/each}
			</ul>

			<h4
				on:click={() => {
					goto(link.split('/')[1])
				}}>
				{link.split('/')[1]}
			</h4>
		</div>
	</div>
</div>

<style>
	.preview {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		/* justify-content: end; */
		width: 300px;
		height: 360px;
		padding: 0 0.5rem;
	}

	.row {
		display: flex;
		flex-wrap: nowrap;
		justify-content: center;
		align-items: center;
	}

	.bottom-row {
		display: flex;
		flex-wrap: nowrap;
		justify-content: space-between;
		align-items: center;
	}

	.bottom-row ul {
		list-style: none;
		display: flex;
		overflow: hidden;
		padding: 0;
	}

	.bottom-row ul li {
		text-decoration: none;
		background-color: #ddd;
		color: #555;
		padding: 0.2rem 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
		height: 1rem;
		line-height: 1rem;
		border-radius: 0.7rem;
		margin-right: 0.4rem;
	}

	.rating-count {
		margin: 0 0 0 1rem;
		align-items: center;
		color: var(--color-grey-7);
	}

	h3 {
		display: -webkit-box;
		font-size: 1.4rem;
		font-weight: 600;
		text-align: left;
		margin: 0;
		max-width: 220px;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	h3:hover {
		color: var(--accent-color);
	}

	.intensity {
		position: absolute;
		display: block !important;
		border-radius: 9000px !important;
		clip-path: circle(50%);
		width: 5rem;
		height: 5rem;
		right: 0;
		background-color: #f1f1f1;
		border: 4px solid #555;
		z-index: 1;
	}

	.intensity img {
		padding: 1rem;
		height: 3rem;
		width: 3rem;
		border: none;
	}

	.description {
		margin: 0;
		-webkit-box-orient: vertical;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;
	}

	h4 {
		margin: 0.5rem 0rem;
		text-align: right;
	}

	h4:hover {
		color: var(--accent-color);
	}

	.cover_image {
		position: relative;
		width: 100%;
		overflow: hidden;
	}

	.cover_image img {
		border: none;
		width: 100%;
		height: 200px;
		object-fit: contain;
		vertical-align: top;
	}
</style>
