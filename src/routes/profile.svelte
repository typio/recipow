<script context="module">
	// if not logged in redirect to home page
	/** @type {import('@sveltejs/kit').Load} */
	export const load = async ({ session }) => {
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

<script>
	import { session } from '$app/stores'
	import Overlay from '$lib/components/header/Overlay.svelte'
	import UserEntry from '$lib/components/header/UserEntry.svelte'

	let formType = 'none'

	/** @type {string}*/
	let name = $session.user.name
	/** @type {FileList}*/
	let files
	/** @type {File}*/
	let avatarFile

	const updateUser = async () => {
		const dataArray = new FormData()
		if (files?.item(0) instanceof File) {
			avatarFile = files.item(0) || new File([''], 'avatar.png')
			dataArray.append('newAvatarFile', avatarFile)
		}
		dataArray.append('newName', name)
		const res = await fetch('/auth/update', {
			method: 'POST',
			body: dataArray
		})
		location.reload()
	}

	const deleteUser = async (/** @type {{ detail: { text: string; }; }} */ event) => {
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
			if (name.length > 0) updateUser()
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
