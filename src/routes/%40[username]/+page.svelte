<script lang="ts">
	import { session } from '$app/stores'
	import RecipeCollection from '$lib/components/recipe/RecipeCollection.svelte'

	import type { User } from '$lib/types'

	export let user: User
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<div class="content">
	{#if $session.user?.email === user.email}
		<h1>Profile</h1>

		<h2>
			Hello {user.name}!
		</h2>

		<div class="row">
			<div class="pfp-display">
				<img src={user.avatar} alt="" />
			</div>
		</div>
		<h3>{user.name}</h3>
		<h4>{'@' + user.username}</h4>

		<h2>Here are your recipies</h2>
		<RecipeCollection type={'user'} username={user.username} />
	{:else}
		<h2>
			{user.name}'s Profile
		</h2>

		<div class="row">
			<div class="pfp-display">
				<img src={user.avatar} alt="{user.name}'s profile photo" />
			</div>
		</div>
		<div>
			<h3>{user.name}</h3>
			<h4>{'@' + user.username}</h4>
		</div>

		<h2>Their recipes:</h2>
		<RecipeCollection type={'user'} username={user.username} />
	{/if}
</div>

<style>
	.row {
		display: flex;
		justify-content: left;
	}
</style>
