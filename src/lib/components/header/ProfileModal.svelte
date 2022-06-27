<script>
	import { goto } from '$app/navigation'
	import { logOut } from '$lib/components/header/Header.svelte'

	export let showProfileModal = true
</script>

<div class="profile-modal">
	<ul>
		<li>
			<button
				on:click={() => {
					showProfileModal = false
					goto('/profile')
				}}>
				View Profile
			</button>
		</li>
        <hr>
		<li>
			<button
				on:click={() => {
				}}>
				Does nothing 1
			</button>
		</li>
		<li>
			<button
				on:click={() => {
				}}>
				Does nothing 2
			</button>
		</li>
		<li>
			<button
				on:click={() => {
				}}>
				Does nothing 3
			</button>
		</li>
        <hr>
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
	ul {
		position: relative;
		padding: 1em;
		margin: 0;
		justify-content: center;
		align-items: center;
		list-style: none;
        width: 11em;
	}

    li {
        padding: 5px 0;
    }

	.profile-modal {
		position: absolute;
		right: 0;
		margin: -5px -8em 0 0;
		border-radius: 0.4rem;
		background-color: var(--color-grey-12);
		z-index: 100;
        box-shadow: 3px 3px 3px var(--color-grey-7);
	}

	.profile-modal button {
        
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
		cursor: pointer;
		background: none;
		border: none;
	}

	button:hover {
		color: var(--accent-color);
	}
</style>
