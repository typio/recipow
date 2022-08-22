<script lang="ts">
	import tippy from 'sveltejs-tippy'
	import 'tippy.js/animations/perspective.css'
	import 'tippy.js/animations/scale.css'
	import 'tippy.js/dist/border.css'
	import { toast } from '@zerodevx/svelte-toast'

	import { page } from '$app/stores'
	import Overlay from '$lib/components/header/Overlay.svelte'
	import UserEntry from '$lib/components/header/UserEntry.svelte'

	let formType = 'none'

	let name: string = $page.data.user.name
	let username: string = $page.data.user.username
	let files: FileList
	let avatarFile: File | undefined

	// https://stackoverflow.com/a/39906526/6806458
	const niceBytes = (a: number) => {
		let b = 0
		for (; 1024 <= a && ++b; ) a /= 1024
		return (
			a.toFixed(10 > a && 0 < b ? 1 : 0) +
			' ' +
			['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'][b]
		)
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
			toast.push(
				'<h4>Avatar must be smaller than 2 MB. Your image is ' +
					niceBytes(avatarFile.size) +
					'.</h4>'
			)
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
		const recipesResult = await fetch('/@' + $page.data.user.username + '/', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			}
		})
		const { recipes } = await recipesResult.json()
		console.log(recipes)
		recipes.forEach(async recipe => {
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
	const nameHelpTippy = {
		content: 'This is your display name, <br/>It will be shown on your recipes.',
		allowHTML: true,
		placement: 'left',
		theme: 'poptart',
		animation: 'scale',
		hideOnClick: false
	}
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="content">
	<h1>Settings</h1>

	<h2>
		Hello {$page.data.user.name}!
	</h2>
	<div use:tippy={nameHelpTippy} class="row">
		<p>Name:</p>
		<input class="text-input" type="text" label="Name: " bind:value={name} />
	</div>
	<div class="row">
		<p>Profile Picture:</p>
		<div class="pfp-input">
			<img src={$page.data.user.avatar} alt="" />
			<input type="file" accept="image/*" bind:files alt="" />
		</div>
	</div>
	<div class="row">
		<p>Email: {$page.data.user.email}</p>
		<!-- <input type="text" label="Name: " value="{user.email}"> -->
	</div>
	<div class="row">
		<p>Username:</p>
		<input class="text-input" type="text" label="Name: " bind:value={username} />
		<div class="break" />
		<p>
			Your URL is <a href={'/' + '@' + $page.data.user.username}>
				https://recipow.com/{'@' + username.replaceAll(' ', '')}</a>
		</p>
	</div>
	<button
		class="btn"
		on:click={() => {
			updateUser()
		}}>Update Details</button>

	<br />
	<br />

	<button
		class="btn btn-danger"
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
