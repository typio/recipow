<script context="module">
	export const logOut = async () => {
		const response = await fetch('/auth/logout', {
			method: 'POST'
		})

		if (response.status === 200) location.reload()
	}
</script>

<script>
	import { page, session } from '$app/stores'
	import { prefetch } from '$app/navigation'

	import svelte_logo from '$lib/assets/svelte-logo.svg'
	import github_logo from '$lib/assets/github-mark.svg'
	import UserEntry from '$lib/components/header/UserEntry.svelte'
	import ProfileModal from '$lib/components/header/ProfileModal.svelte'
	import Overlay from './Overlay.svelte'

	let formType = 'none'

	let showProfileModal = false
</script>

<header>
	<div class="corner">
		<a href="https://kit.svelte.dev">
			<img src={svelte_logo} alt=" " />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li class:active={$page.url.pathname === '/'} class="a-nav">
				<a sveltekit:prefetch href="/">Home</a>
			</li>
			<li class:active={$page.url.pathname === '/new-recipe'} class="a-nav">
				<a sveltekit:prefetch href="new-recipe">Write</a>
			</li>
			{#if $session.user}
				<!-- <li class:active={$page.url.pathname === '/new-recipe'} class="a-nav">
					<a sveltekit:prefetch href="new-recipe">Write</a>
				</li> -->
				<li class:active={$page.url.pathname === '/profile'}>
					<button
						class="btn-nav btn-pfp"
						on:click={() => {
							prefetch('/profile')
							showProfileModal = !showProfileModal
						}}>
						<img src={$session.user.avatar} alt=" " />
					</button>
				</li>
				<li>
					<button class="btn-nav" on:click={logOut}>Log Out</button>
				</li>
			{:else}
				<li>
					<button
						class="btn-nav"
						on:click={() => {
							formType = 'logIn'
						}}>Log In</button>
				</li>
				<li>
					<button
						class="btn-nav"
						on:click={() => {
							formType = 'signUp'
						}}>Sign Up</button>
				</li>
			{/if}
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner">
		<a href="https://github.com/typio/recipow">
			<img src={github_logo} alt=" " />
		</a>
	</div>

	{#if showProfileModal}
		<ProfileModal bind:showProfileModal />
	{/if}

	{#if formType != 'none'}
		<Overlay
			on:clicked={() => {
				formType = 'none'
			}} />
		<UserEntry bind:formType />
	{/if}

	{#if showProfileModal}
		<Overlay
			color={'hsla(0, 0%, 0%, 0%)'}
			on:clicked={() => {
				showProfileModal = false
			}} />
	{/if}
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
		--background: #fff;
		filter: drop-shadow(0 0px 4px rgba(0, 0, 0, 0.6))
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
		display: flex;
		align-items: center;
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
</style>
