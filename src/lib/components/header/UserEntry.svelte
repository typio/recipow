<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let formType = 'none'

	let inputEmail = ''
	let inputPassword = ''
	let errorMessage = ''

	// could dispatch the credentials for this,
	// but it wouldn't make any more sense to have login logic in header...
	export const signUp = async () => {
		const response = await fetch('/auth/signup', {
			method: 'POST',
			body: JSON.stringify({
				email: inputEmail,
				password: inputPassword
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
		const response = await fetch('/auth/login', {
			method: 'POST',
			body: JSON.stringify({
				email: inputEmail,
				password: inputPassword
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

	// this is safe right?
	const dispatchCredentials = () => {
		dispatch('credentials', {
			text: JSON.stringify({
				email: inputEmail,
				password: inputPassword
			})
		})
	}
</script>

<div class="user-entry-form">
	<div class="hello">
		<ul>
			{#if formType === 'signUp' || formType === 'logIn'}
				<li>
					<button
						class="tab-btns"
						class:selected={formType === 'signUp'}
						on:click={() => {
							if (formType === 'logIn') {
								inputEmail = ''
								inputPassword = ''
							}
							formType = 'signUp'
							errorMessage = ''
						}}>Sign Up</button>
				</li>
				<li>
					<button
						class="tab-btns"
						class:selected={formType === 'logIn'}
						on:click={() => {
							if (formType === 'signUp') {
								inputEmail = ''
								inputPassword = ''
							}
							formType = 'logIn'
							errorMessage = ''
						}}>Log In</button>
				</li>
			{:else if formType === 'deleteAccount'}
				<li>
					<button class="tab-btns" class:selected={formType === 'deleteAccount'}
						>Delete Account</button>
				</li>
			{/if}
		</ul>

		<button
			class="close-form-btn"
			on:click={() => {
				formType = 'none'
			}}>X</button>
	</div>

	{#if errorMessage}
		<div class="error-message"><p>{errorMessage}</p></div>
	{/if}

	<form class="signup-form">
		{#if formType === 'signUp'}
			<p style="font-weight: 700; font-size: .94rem; color:#555">
				Password must have one lowercase, uppercase, number and be 8+ characters.
			</p>
		{:else if formType === 'deleteAccount'}
			<p style="font-weight: 700; font-size: .94rem; color:#555">
				Please confirm your account credentials.
			</p>
		{/if}
		<div>
			<div><label for="email-input">Email:</label></div>
			<div><input id="email-input" type="email" bind:value={inputEmail} /></div>
		</div>

		<div>
			<div><label for="password-input">Password:</label></div>
			<div><input id="password-input" type="password" bind:value={inputPassword} /></div>
		</div>

		{#if formType === 'signUp'}
			<button on:click={signUp} type="button" class="btn submit-form-buttons"> Sign Up </button>
		{:else if formType === 'logIn'}
			<button on:click={logIn} type="button" class="btn submit-form-buttons"> Log In </button>
		{:else if formType === 'deleteAccount'}
			<button
				on:click={dispatchCredentials}
				type="button"
				class="btn btn-danger  submit-form-buttons ">
				Delete Account
			</button>
		{/if}
	</form>
</div>

<style>
	.user-entry-form {
		position: absolute;
		margin: 22vh 0 0 0;
		width: 500px;
		left: calc(50% - 250px);
		padding: 20px;
		background-color: var(--secondary-color);
		border-radius: 4px;
		color: var(--text-color);
		font-weight: 600;
	}

	form {
		display: flex;
		flex-flow: wrap;
		justify-content: center;
	}

	input {
		margin-bottom: 6px;
	}

	.submit-form-buttons {
		margin-top: 10px;
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

	.tab-btns {
		color: var(--text-color);
		font-weight: 600;
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
