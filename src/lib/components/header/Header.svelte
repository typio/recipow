<script lang="ts">
	import { page } from '$app/stores'
	import { prefetch } from '$app/navigation'

	import UserEntry from '$lib/components/header/UserEntry.svelte'
	import ProfileModal from '$lib/components/header/ProfileModal.svelte'
	import Overlay from './Overlay.svelte'
	import DarkModeToggle from './DarkModeToggle.svelte'

	let formType = 'none'

	let showProfileModal = false

	let user = $page.data.user

	const logOut = async () => {
		const response = await fetch('/auth/logout', {
			method: 'POST'
		})

		if (response.status === 200) location.reload()
	}
</script>

<header class="w-screen mt-4 mb-10">
	<div class="flex mx-auto place-content-evenly max-w-sm sm:max-w-lg md:max-w-lg lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl">
		<nav class=" px-3 text-xs sm:text-sm sm:py-1 sm:px-6 whitespace-nowrap font-bold font-sans shadow-md rounded-full bg-stone-100 dark:bg-stone-800">
			<ul class=" flex space-x-4">
				<li class="leading-10 h-10 {$page.url.pathname === '/' ? 'text-red-500 ' : ''} uppercase tracking-wider">
					<a sveltekit:prefetch href="/">For You</a>
				</li>

				<li class="leading-10 h-10 {$page.url.pathname === '/browse' ? 'text-red-500 ' : ''} uppercase tracking-wider">
					<a sveltekit:prefetch href="/browse">Browse</a>
				</li>

				{#if user}
					<button
						class=""
						on:click={() => {
							prefetch('/@' + user.username)
							prefetch('/settings')
							showProfileModal = !showProfileModal
						}}>
						<img class="w-8 h-8 sm:w-10 sm:h-10 leading-10 rounded-full" src={user.avatar} alt=" " />
					</button>
					<li class="leading-10 h-10 {$page.url.pathname === '/new-recipe' ? 'text-red-500 ' : ''} uppercase tracking-wider">
						<a sveltekit:prefetch href="/new-recipe">Write</a>
					</li>
				{:else}
					<li>
						<button
							class="uppercase tracking-wider leading-10 h-10"
							on:click={() => {
								formType = 'logIn'
							}}>Log In</button>
					</li>
					<li>
						<button
							class="uppercase tracking-wider leading-10 h-10"
							on:click={() => {
								formType = 'signUp'
							}}>Sign Up</button>
					</li>
				{/if}
			</ul>
		</nav>

		<DarkModeToggle />

		{#if showProfileModal}
			<ProfileModal bind:showProfileModal on:logOut={logOut} />
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
	</div>
</header>
