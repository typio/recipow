<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit'
	// if not logged in redirect to home page
	export const load: Load = async ({ session }) => {
		if (!session.user) {
			return {
				status: 302,
				redirect: '/'
			}
		} else {
			return {
				status: 200
			}
		}
	}
</script>

<script lang="ts">
	import { toast } from '@zerodevx/svelte-toast'

	import { session } from '$app/stores'
	import Overlay from '$lib/components/header/Overlay.svelte'
	import UserEntry from '$lib/components/header/UserEntry.svelte'

	let formType = 'none'

	let name: string = $session.user.name
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
		// checks can probably be bypassed
		if (name.length < 2) {
			toast.push('<h4>Name must be at least 2 characters</h4>')
			return
		} else {
			if (avatarFile == undefined) {
				toast.push('<h4>Updating User...</h4>')
			} else if (avatarFile.size < 2000000) {
				toast.push(
					'<h4>Updating User...</h4><p>Large photos may take a few seconds to process.</p>'
				)
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
			const res = await fetch('/auth/update', {
				method: 'POST',
				body: dataArray
			})
			const out = await res.json()
			console.log(out)
			location.reload()
		}
	}

	const deleteUser = async (event: { detail: { text: string } }) => {
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
	<title>Profile</title>
</svelte:head>

<div class="content">
	<h1>Profile</h1>

	<h2>
		Hello {$session.user.name}!
	</h2>
	<div class="row">
		<p>Name:</p>
		<input class="text-input" type="text" label="Name: " bind:value={name} />
	</div>
	<div class="row">
		<p>Profile Picture:</p>
		<div class="pfp-input">
			<img src={$session.user.avatar} alt="" />
			<input type="file" accept="image/*" bind:files alt="" />
		</div>
	</div>
	<div class="row">
		<p>Email: {$session.user.email}</p>
		<!-- <input type="text" label="Name: " value="{user.email}"> -->
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
