<script context="module">
	/** @type {import('@sveltejs/kit').Load} */
	export const load = async ({ session }) => {
		// if not logged in redirect to home page
		const loggedIn = session.sessionId !== undefined

		return {
			status: 200,
			props: {
				loggedIn: loggedIn
			}
		}
	}
</script>

<script>
	import Header from '$lib/components/header/Header.svelte'
	import { page, session } from '$app/stores'
	import { get } from 'svelte/store'
	import '../app.css'

	/** @type {boolean}*/
	export let loggedIn
</script>

<Header {loggedIn} />

<main>
	<slot />
</main>

<footer>
	<p>This is a website. Here is <a href="https://google.com">google.com</a>.</p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
