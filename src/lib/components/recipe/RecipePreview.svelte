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
		max-width: 300px;
	}

	h1 {
		font-size: 2rem;
		height: 15%;
		margin: 5%;
		
	}

	h1:hover {
		color: var(--accent-color);
	}

	h3 {
		font-size: 1.2rem;
		text-align: center;
		margin: 0;
		height: 15%;
	}

	img {
		height: 60%;
		object-fit: cover;
		width: 100%;
		object-position: 0 0;
		margin-top: auto;
	}
</style>
