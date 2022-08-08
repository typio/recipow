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
	<img src={recipe.cover_image} alt="" />
</div>

<style>
	.preview {
		border: 3px solid #ccc;
		height: 300px;
	}

	h1 {
		font-size: 2rem;
		height: 20%;
	}

	h1:hover {
		color: var(--accent-color);
	}

	img {
		width: 100%;
	}
</style>
