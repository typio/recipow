<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast'

	import { page } from '$app/stores'
	import Overlay from '$lib/components/header/Overlay.svelte'
	import UserEntry from '$lib/components/header/UserEntry.svelte'
	import type { Recipe } from '$lib/types'

	let formType = 'none'

	let name: string = $page.data.user.name
	let username: string = $page.data.user.username
	let files: FileList
	let avatarFile: File | undefined

	// https://stackoverflow.com/a/39906526/6806458
	const niceBytes = (a: number) => {
		let b = 0
		for (; 1024 <= a && ++b; ) a /= 1024
		return a.toFixed(10 > a && 0 < b ? 1 : 0) + ' ' + ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][b]
	}

	const updateUser = async () => {
		const dataArray = new FormData()
		avatarFile = files?.item(0) || undefined
		// check can probably be bypassed
		if (avatarFile == undefined) {
			toast.push('<h4>Updating User...</h4>')
		} else if (avatarFile.size < 2000000) {
			toast.push('<h4>Updating User...</h4><p>Large photos may take a few seconds to process.</p>')
			dataArray.append('newAvatarFile', avatarFile)
		} else {
			toast.push('<h4>Avatar must be smaller than 2 MB. Your image is ' + niceBytes(avatarFile.size) + '.</h4>')
			return
		}

		dataArray.append('newName', name)
		dataArray.append('newUsername', username)
		const res = await fetch('/auth/update', {
			method: 'POST',
			body: dataArray
		})

		if (res.status === 200) {
			location.reload()
		} else {
			toast.pop()
			const out = await res.json()
			toast.push(`<h4>${out.message}</h4>`)
		}
	}

	const deleteUser = async (event: { detail: { text: string } }) => {
		// delete their recipes
		const recipesResult = await fetch(`/recipe?type=${'user'}&page=${1}&limit=${1000}&username=${username}`, { method: 'GET' })
		const { recipesAndLinks } = await recipesResult.json()
		recipesAndLinks?.forEach(async ({ recipe }: { recipe: Recipe }) => {
			console.log(recipe)
			const res = await fetch(`/recipe`, {
				method: 'DELETE',
				body: JSON.stringify({
					recipeId: recipe.id
				}),
				headers: {
					'content-type': 'application/json',
					accept: 'application/json'
				}
			})
			const data = await res.json()
			console.log(data)
		})

		// delete their account
		const res = await fetch('/auth/delete', {
			method: 'POST',
			body: JSON.stringify({
				email: JSON.parse(event.detail.text).email,
				password: JSON.parse(event.detail.text).password
			})
		})
		location.reload()
	}
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="content mx-4 space-y-2">
	<h1 class="font-semibold text-xl mb-6">Settings</h1>

	<h2>
		Hello {$page.data.user.name}!
	</h2>
	<div class="row">
		<p>Name:</p>
		<input class="text-input" type="text" bind:value={name} />
	</div>
	<div class="row flex flex-row ">
		<p>Profile Picture:</p>
		<div class="pfp-input">
			<img class="rounded-full" src={$page.data.user.avatar} alt="" />
			<input type="file" accept="image/*" bind:files alt="" />
		</div>
	</div>
	<div class="row">
		<p>Email: {$page.data.user.email}</p>
		<!-- <input type="text" label="Name: " value="{user.email}"> -->
	</div>
	<div class="row">
		<p>Username:</p>
		<input class="text-input" type="text" bind:value={username} />
		<div class="break" />
		<p>
			Your URL is <a href={'/' + '@' + $page.data.user.username}> https://recipow.com/{'@' + username.replaceAll(' ', '')}</a>
		</p>
	</div>
	<button
		class="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold rounded-lg h-10 px-4"
		on:click={() => {
			updateUser()
		}}>Update Details</button>

	<button
		class="bg-red-600 hover:bg-red-700 text-stone-50 font-semibold rounded-lg h-10 px-4"
		on:click={() => {
			formType = 'deleteAccount'
		}}>Delete Account</button>
</div>

{#if formType !== 'none'}
	<Overlay
		on:clicked={() => {
			formType = 'none'
		}} />
	<UserEntry bind:formType on:credentials={deleteUser} />
{/if}

<style>
	.row {
		display: flex;
		justify-content: left;
		flex-wrap: wrap;
	}
	.break {
		width: 100%;
	}

	.row input[type='text'] {
		border: none;
		border-bottom: 2px solid lightgray;
		background-color: transparent;
		height: fit-content;
		margin: auto 0 auto 1em;
	}

	.row input[type='text']:focus {
		border-bottom: 2px solid var(--accent-color);
		outline: none;
	}

	.pfp-input {
		margin-left: 1em;
		width: min-content;
	}
</style>
