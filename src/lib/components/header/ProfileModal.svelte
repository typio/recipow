<script lang="ts">
	import { goto, prefetch } from '$app/navigation'
	import { logOut } from '$lib/components/header/Header.svelte'
	import { session } from '$app/stores'

	export let showProfileModal = true
</script>

<div class="profile-modal">
	<ul>
		<li>
			<button
				class="btn-nav btn-pfp"
				on:click={() => {
					prefetch('/profile')
					goto('/profile')
					showProfileModal = false
				}}>
				<img src={$session.user.avatar} alt=" " />
			</button>

			<div class="name-display">
				<p class="name">{$session.user.name}</p>
				<p class="username">{`@${$session.user.username}`}</p>
			</div>
		</li>
		<hr />
		<li>
			<button
				on:click={() => {
					showProfileModal = false
					goto('/@' + $session.user.username)
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
					logOut()
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
		left: 51vw;
		top: 3.4vh;
		border-radius: 0.4rem;
		background-color: #fff;
		box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
	}

	.profile-modal button {
		margin: 0 12px 0 6px;
		padding: 0;
		display: flex;
		height: 100%;
		align-items: center;
		color: var(--heading-color);
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
		color: var(--text-color);
	}

	button:hover {
		color: var(--accent-color);
	}
</style>
