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

	onMount(async () => {
		const res = await fetch('/api/user', {
			method: 'POST',
			body: JSON.stringify({
				id: (await (await fetch('/api/auth')).json()).email
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		user = await res.json()
	})

	/** @type {import('$lib/types').user} */
	let user = {
		id: '',
		name: '',
		email: '',
		avatar: ''
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
		<input class="text-input" type="text" label="Name: " value={user.name} />
	</div>
	<div class="row">
		<p>Profile Picture:</p>
		<div class="pfp-input">
			<img src={user.avatar} alt="" />
			<input type="file" src={user.avatar} alt="" />
		</div>
	</div>
	<div class="row">
		<p>Email: {user.email}</p>
		<!-- <input type="text" label="Name: " value="{user.email}"> -->
	</div>
	<button>Update Details</button>
	<br />
	<br />
	<button class="button-red">Delete Account</button>
</div>

<style>
	.content {
	}

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
