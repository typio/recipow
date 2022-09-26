<script lang="ts">
	import { goto, prefetch } from '$app/navigation'
	import { page } from '$app/stores'
	import { createEventDispatcher } from 'svelte'

	export let showProfileModal = true
	const dispatch = createEventDispatcher()
</script>

<div class="profile-modal bg-stone-100 dark:bg-stone-800 shadow-xl">
	<ul>
		<li>
			<button
				class="btn-nav btn-pfp"
				on:click={() => {
					prefetch('/profile')
					goto('/profile')
					showProfileModal = false
				}}>
				<img src={$page.data.user.avatar} alt=" " />
			</button>

			<div class="name-display">
				<p class="name">{$page.data.user.name}</p>
				<p class="username">{`@${$page.data.user.username}`}</p>
			</div>
		</li>
		<hr />
		<li>
			<button
				on:click={() => {
					showProfileModal = false
					goto('/@' + $page.data.user.username)
				}}>
				View Profile
			</button>
		</li>
		<li>
			<button
				on:click={() => {
					showProfileModal = false
					goto('/settings')
				}}>
				Settings
			</button>
		</li>
		<hr />
		<li>
			<button
				on:click={() => {
					showProfileModal = false
					dispatch('logOut')
				}}>
				Logout
			</button>
		</li>
	</ul>
</div>

<style>
	.profile-modal {
		position: absolute;
		z-index: 100;
		top: 3.4vh;
		border-radius: 0.4rem;
	}

	.profile-modal button {
		margin: 0 12px 0 6px;
		padding: 0;
		display: flex;
		height: 100%;
		align-items: center;
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
		cursor: pointer;
		background: none;
		border: none;
	}

	ul {
		position: relative;
		padding: 1rem;
		margin: 0;
		justify-content: center;
		align-items: center;
		list-style: none;
		width: fit-content;
		min-width: 150px;
	}

	li {
		display: flex;
		flex-direction: row;
		padding: 5px 0;
		align-items: center;
	}

	li p {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		width: fit-content;
		max-width: 150px;
		text-overflow: ellipsis;
	}

	.name-display {
		display: flex;
		flex-direction: column;
	}

	.name-display .username {
		font-size: 0.85rem;
	}

	button:hover {
	}
</style>
