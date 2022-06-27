<script context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export const load = async ({ session }) => {
		// if not logged in redirect to home page
		if (session.sessionId === undefined) {
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
	import { onMount } from 'svelte'

	/** @type {import('$lib/types').user} */
	let user = {
		id: '',
		name: '',
		email: '',
		avatar: ''
	}

	/** @type {string}*/
	let name
	/** @type {string}*/
	let avatar

	onMount(async () => {
		const res = await fetch('/api/user', {
			method: 'POST',
			body: JSON.stringify({
				type: 'getUser',
				id: (await (await fetch('/api/auth')).json()).email
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		user = await res.json()
		name = user.name
		avatar = user.avatar
	})

	const updateUser = async () => {
		console.log(name);
		const res = await fetch('/api/user', {
			method: 'PATCH',
			body: JSON.stringify({
				type: 'updateUser',
				id: (await (await fetch('/api/auth')).json()).email,
				newName: name,
				newAvatar: avatar
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		console.log(await res.json())
		location.reload()
	}
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<div class="content">
	<h1>Profile</h1>

	<h2>
		Hello {user.name}!
	</h2>
	<div class="row">
		<p>Name:</p>
		<input class="text-input" type="text" label="Name: " bind:value={name} />
	</div>
	<div class="row">
		<p>Profile Picture:</p>
		<div class="pfp-input">
			<img src={user.avatar} alt="" />
			<input type="text" bind:value={avatar} alt="" />
		</div>
	</div>
	<div class="row">
		<p>Email: {user.email}</p>
		<!-- <input type="text" label="Name: " value="{user.email}"> -->
	</div>
	<button on:click={updateUser}>Update Details</button>
	<br />
	<br />
	<button class="button-red">Delete Account</button>
</div>

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

	.button-red {
		background-color: #eb0400;
		color: #fff;
	}

	.button-red:hover {
		background-color: #d00;
	}
</style>
