<script lang="ts">
	import { page, session } from '$app/stores'
	import { get } from 'svelte/store'
	import { goto } from '$app/navigation'
	import svelte_logo from './svelte-logo.svg'
	import github_logo from './github-mark.svg'

	import UserEntry from '$lib/components/UserEntry.svelte'

	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	interface Sesh {
		[x: string]: any
	}

	const sesh: Sesh = get(session)
	const loggedIn = sesh.auth

	let showForm = false
	let showSignUp = true

	export const logOut = async () => {
		const response = await fetch('auth', {
			method: 'POST',
			body: JSON.stringify({
				type: 'logout',
				email: '',
				password: ''
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		})

		if (response.status === 200) {
			dispatch('success')
			const data = await response.json()
			console.log(data)
			location.reload()
		} else {
			dispatch('error')
		}
	}
</script>

<header>
	<div class="corner">
		<a href="https://kit.svelte.dev">
			<img src={svelte_logo} alt="SvelteKit" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li class:active={$page.url.pathname === '/'}><a sveltekit:prefetch href="/">Home</a></li>
			<li class:active={$page.url.pathname === '/about'}>
				<a sveltekit:prefetch href="/about">About</a>
			</li>
			<!-- <li class:active={$page.url.pathname === '/todos'}>
				<a sveltekit:prefetch href="/todos">Todos</a>
			</li> -->
			<li
				style="display: {loggedIn ? 'block' : 'none'}"
				class:active={$page.url.pathname === '/profile'}>
				<a sveltekit:prefetch href="/profile">Profile</a>
			</li>

			<li style="display: {loggedIn ? 'none' : 'block'}">
				<button
					on:click={() => {
						showForm = true
						showSignUp = false
					}}>Log In</button>
			</li>
			<li style="display: {loggedIn ? 'none' : 'block'}">
				<button
					on:click={() => {
						showForm = true
						showSignUp = true
					}}>Sign Up</button>
			</li>

			<li style="display: {loggedIn ? 'block' : 'none'}">
				<button on:click={logOut}>Log Out</button>
			</li>

		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner">
		<!-- TODO put something else here? github link? -->
		<a href="https://github.com/typio/recipow">
			<img src={github_logo} alt="Github" />
		</a>
	</div>

	<div
		class="user-entry-overlay"
		style="display: {showForm ? 'block' : 'none'}"
		on:click={() => {
			showForm = false
		}} />
	<div class="user-entry-form">
		<UserEntry bind:showForm bind:showSignUp />
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
	}

	.user-entry-overlay {
		position: absolute;
		margin: 0;
		top: 0;

		width: 100%;
		height: 100%;
		background-color: hsla(0, 0%, 0%, 40%);
	}

	.user-entry-form {
		position: absolute;
		width: 500px;
		top: calc(50% - 250px);
		left: calc(50% - 250px);
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}

	nav a,
	nav button {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	nav button {
		cursor: pointer;
		background: none;
		border: none;
	}

	a:hover,
	button:hover {
		color: var(--accent-color);
	}
</style>
