<script>
	import { goto } from '$app/navigation'
	import { createEventDispatcher } from 'svelte'
	import { page } from '$app/stores'

	const dispatch = createEventDispatcher()

	export let showForm = false
	export let showSignUp = true

	/** @type {string} */
	let logInEmail
	/** @type {string} */
	let logInPassword
	/** @type {string} */
	let signUpEmail
	/** @type {string} */
	let signUpPassword
	/** @type {string} */
	let errorMessage = ''

	export const signUp = async () => {
		const response = await fetch('auth', {
			method: 'POST',
			body: JSON.stringify({
				type: 'signup',
				email: signUpEmail,
				password: signUpPassword
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
			const data = await response.json()
			errorMessage = data.message
			dispatch('error')
		}
	}

	const logIn = async () => {
		const response = await fetch('auth', {
			method: 'POST',
			body: JSON.stringify({
				type: 'login',
				email: logInEmail,
				password: logInPassword
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
			const data = await response.json()
			errorMessage = data.message
			dispatch('error')
		}
	}
</script>

<div class="user-entry-form" style="display: {showForm ? 'block' : 'none'}">
	<div class="hello">
		<ul>
			<li>
				<button
					class="signup-login-btns"
					class:selected={showSignUp === true}
					on:click={() => {
						showSignUp = true
						errorMessage = ''
					}}>Sign Up</button>
			</li>
			<li>
				<button
					class="signup-login-btns"
					class:selected={showSignUp === false}
					on:click={() => {
						showSignUp = false
						errorMessage = ''
					}}>Log In</button>
			</li>
		</ul>
		<button
			class="close-form-btn"
			on:click={() => {
				showForm = false
			}}>X</button>
	</div>

	<div class="error-message"><p>{errorMessage}</p></div>
	<form
		on:submit|preventDefault={signUp}
		method="POST"
		class="signup-form"
		style="display: {showSignUp ? 'block' : 'none'}">
		<div>
			<div><label for="signup-email-input">Email:</label></div>
			<div><input id="signup-email-input" type="email" bind:value={signUpEmail} /></div>
		</div>

		<div>
			<div><label for="signup-password-input">Password:</label></div>
			<div><input id="signup-password-input" type="password" bind:value={signUpPassword} /></div>
		</div>

		<button type="submit" class="submit-form-buttons"> Sign Up </button>
	</form>

	<form
		on:submit|preventDefault={logIn}
		method="POST"
		class="login-form"
		style="display: {showSignUp ? 'none' : 'block'}">
		<div>
			<div><label for="login-email-input">Email:</label></div>
			<div><input id="login-email-input" type="email" bind:value={logInEmail} /></div>
		</div>

		<div>
			<div><label for="login-password-input">Password:</label></div>
			<div><input id="login-password-input" type="password" bind:value={logInPassword} /></div>
		</div>
		<button type="submit" class="submit-form-buttons"> Log In </button>
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
