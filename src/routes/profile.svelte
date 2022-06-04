<script context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export const load = async ({ session }) => {
		if (!session.auth) {
			return {
				status: 302,
				redirect: '/'
			}
		} else {
			return {
				props: {
					email: session.email
				}
			}
		}
	}
</script>

<script>
	import { onMount } from 'svelte'

	/** @type {string} */
	export let email

	/** @type {string} */
	let name

	// TODO: implement USER endpoint and mongoDB

	// onMount(async () => {
	// 	const res = await fetch('/user')
	// 	const user = await res.json()
	// 	name = user.name
	// 	email = user.email
	// })
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<div class="content">
	<h1>Profile</h1>

	<h2>
		Hello {name}!
	</h2>
	<p>Email: {email}</p>
</div>
