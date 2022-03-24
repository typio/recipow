<script lang="ts">
	import { goto } from '$app/navigation'
	import { createEventDispatcher } from 'svelte'
	import { browser } from '$app/env'

	const dispatch = createEventDispatcher()

	export let showForm = false
	export let showSignUp = true

	let logInEmail: string
	let logInPassword: string
	let signUpEmail: string
	let signUpPassword: string

	export const signUp = async () => {
		// const response = await fetch('auth', {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json'
		// 	},
		// 	body: JSON.stringify({
		// 		type: 'signup',
		// 		email: signUpEmail,
		// 		password: signUpPassword
		// 	})
		// })
		// if (response.ok) {
		// 	console.log('Success')
		// 	dispatch('Success')
		// } else {
		// 	console.log('Error')
		// }

		const { response } = await (
			await fetch('auth', {
				method: 'POST'
			})
		).json()
		console.log(response)
	}

	const logIn = async () => {
		alert('login')
		// if (error == null) goto('/profile')
	}

	let gotValue = 'before'

	const getMessage = async () => {
		const response = await fetch('auth', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		if (response.ok) {
			console.log('Success')
			dispatch('Success')
			const { message } = await (await fetch('auth')).json()
			console.log(message)
			gotValue = message
		} else {
			console.log('Error')
		}
	}
</script>

<p>{gotValue}</p>
<button on:click={getMessage}>test</button>

<div class="user-entry-form" style="display: {showForm ? 'block' : 'none'}">
	<div class="hello">
		<ul>
			<li>
				<button
					class="signup-login-btns"
					class:selected={showSignUp === true}
					on:click={() => {
						showSignUp = true
					}}>Sign Up</button>
			</li>
			<li>
				<button
					class="signup-login-btns"
					class:selected={showSignUp === false}
					on:click={() => {
						showSignUp = false
					}}>Log In</button>
			</li>
		</ul>
		<button
			class="close-form-btn"
			on:click={() => {
				showForm = false
			}}>X</button>
	</div>

	<form method="POST" class="signup-form" style="display: {showSignUp ? 'block' : 'none'}">
		<div>
			<div><label for="signup-email-input">Email:</label></div>
			<div><input id="signup-email-input" type="email" bind:value={signUpEmail} /></div>
		</div>

		<div>
			<div><label for="signup-password-input">Password:</label></div>
			<div><input id="signup-password-input" type="password" bind:value={signUpPassword} /></div>
		</div>

		<button class="submit-form-buttons" on:click={signUp}> Sign Up </button>
	</form>

	<form method="POST" class="login-form" style="display: {showSignUp ? 'none' : 'block'}">
		<div>
			<div><label for="login-email-input">Email:</label></div>
			<div><input id="login-email-input" type="email" bind:value={logInEmail} /></div>
		</div>

		<div>
			<div><label for="login-password-input">Password:</label></div>
			<div><input id="login-password-input" type="password" bind:value={logInPassword} /></div>
		</div>
		<button class="submit-form-buttons" on:click={logIn}> Log In </button>
	</form>
</div>

<style>
	.user-entry-form {
		/* positioning and size are in __layout.svelte */
		padding: 20px;
		background-color: var(--secondary-color);
		border-radius: 4px;
		color: var(--text-color);
		font-weight: 600;
	}

	button {
		color: var(--text-color);
		font-weight: 600;
	}

	form {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	input {
		width: 98%;
	}

	.submit-form-buttons {
		width: 100%;
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		display: flex;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	.hello {
		display: flex;
		justify-content: space-between;
	}

	.signup-login-btns {
		background: none;
		border: none;
		padding: 0 10px 0 0;
	}

	.selected {
		color: var(--accent-color);
		text-decoration: underline;
	}

	.close-form-btn {
		justify-content: flex-end;
	}
</style>
