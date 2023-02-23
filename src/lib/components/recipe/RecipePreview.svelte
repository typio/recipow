<script lang="ts">
	import { goto } from '$app/navigation'

	import intensity_1 from '$lib/assets/intensity_1.svg'
	import intensity_2 from '$lib/assets/intensity_2.svg'
	import intensity_3 from '$lib/assets/intensity_3.svg'
	import intensity_4 from '$lib/assets/intensity_4.svg'
	import intensity_5 from '$lib/assets/intensity_5.svg'

	import type { Recipe } from '$lib/types'
	import RatingsBar from './RatingsBar.svelte'
	export let recipe: Recipe
	export let link: string
</script>

<div class="preview w-80 mb-2 mx-2 mt-2">
	<div class="preview-card flex flex-wrap flex-col bg-white dark:bg-stone-800 shadow-md rounded-xl bg-cover bg-no-repeat" style="height: 401px;">
		<div
			class="cover_image bg-cover bg-no-repeat rounded-t-xl grow"
			style="background-image: url({recipe.cover_image})"
			on:click={() => {
				goto(link)
			}} />

		<div class="preview-content px-2 max-w-xs flex flex-wrap flex-col ">
			<h1
				class="title text-2xl font-semibold text-center mt-2"
				on:click={() => {
					goto(link)
				}}>
				{recipe.title}
			</h1>

			<div class="ratings-row place-items-center">
				<div class="max-w-fit mx-auto">
					<RatingsBar active={false} rating={recipe.rating} />
				</div>
				<p class="rating-count text-center font-bold">{recipe.ratingCount} reviews</p>
			</div>
			<p
				class="description text-center"
				on:click={() => {
					goto(link)
				}}>
				{recipe.description}
			</p>

			<h4
				class="username font-bold leading-7 h-7 hover:text-red-500 w-fit "
				on:click={() => {
					goto(link.split('/')[1])
				}}>
				{link.split('/')[1]}
			</h4>
			<div class="bottom-row flex w-full pb-2">
				<div class="flex mr-3">
					<h4 class="font-bold mr-2 leading-8">Intensity</h4>
					<div class="intensity">
						{#if recipe?.intensity == 1}
							<img class="h-8" src={intensity_1} alt="Recipe Intensity Level 1" />
						{:else if recipe?.intensity == 2}
							<img class="h-8" src={intensity_2} alt="Recipe Intensity Level 2" />
						{:else if recipe?.intensity == 3}
							<img class="h-8" src={intensity_3} alt="Recipe Intensity Level 3" />
						{:else if recipe?.intensity == 4}
							<img class="h-8" src={intensity_4} alt="Recipe Intensity Level 4" />
						{:else}
							<img class="h-8" src={intensity_5} alt="Recipe Intensity Level 5" />
						{/if}
					</div>
				</div>
				<div class=" flex overflow-x-scroll  ">
					{#each recipe?.tags || [] as tag}
						<p class="whitespace-nowrap font-semibold text-sm  px-3 py-1 mr-2  bg-stone-200 text-stone-60 dark:bg-stone-600 dark:text-stone-100 rounded-full">{tag}</p>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.description {
		-webkit-box-orient: vertical;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;
	}

	.cover_image {
		position: relative;
		width: 100%;
        max-height: 212px;
		overflow: hidden;
	}

</style>
