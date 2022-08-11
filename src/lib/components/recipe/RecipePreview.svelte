<script lang="ts">
	import { goto } from '$app/navigation'

	import type { Recipe } from '$lib/types'
	export let recipe: Recipe
	export let link: string
</script>

<div
	class="preview"
	on:click={() => {
		goto(link)
	}}>
	<h1>{recipe.title}</h1>
	<h3>{recipe.description}</h3>
	<img src={recipe.cover_image} alt="" />
</div>

<style>
	.preview {
		border: 3px solid #ccc;
		height: 300px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		/* justify-content: end; */
	}

	h1 {
		font-size: 2rem;
		height: 20%;
		margin: .5rem 0 0 0;

	}

	h1:hover {
		color: var(--accent-color);
	}

	h3 {
		font-size: 1.2rem;
		text-align: center;
		margin: .2rem 0 0 0;
	}

	img {
		width: 100%;
		margin-top: auto;
	}
</style>
