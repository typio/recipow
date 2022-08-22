<script lang="ts">
	import RecipeCollection from '$lib/components/recipe/RecipeCollection.svelte'
	import { page } from '$app/stores'

	import type { User } from '$lib/types'

	import type { PageData } from './$types'
	export let data: PageData

	$: ({ pageUser } = data)
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<div class="content">
	{#if $page.data.user?.email === pageUser.email}
		<h1>Profile</h1>

		<h2>
			Hello {pageUser.name}!
		</h2>

		<div class="row">
			<div class="pfp-display">
				<img src={pageUser.avatar} alt="" />
			</div>
		</div>
		<h3>{pageUser.name}</h3>
		<h4>{'@' + pageUser.username}</h4>

		<h2>Here are your recipies</h2>
		<RecipeCollection type={'user'} username={pageUser.username} />
	{:else}
		<h2>
			{pageUser.name}'s Profile
		</h2>

		<div class="row">
			<div class="pfp-display">
				<img src={pageUser.avatar} alt="{pageUser.name}'s profile photo" />
			</div>
		</div>
		<div>
			<h3>{pageUser.name}</h3>
			<h4>{'@' + pageUser.username}</h4>
		</div>

		<h2>Their recipes:</h2>
		<RecipeCollection type={'user'} username={pageUser.username} />
	{/if}
</div>

<style>
	.row {
		display: flex;
		justify-content: left;
	}
</style>
