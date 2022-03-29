<script context="module" lang="ts">
	export const load = async ({ session }: any) => {
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

<script lang="ts">
	import { onMount } from 'svelte'

	export let email: any
	let name: string

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
