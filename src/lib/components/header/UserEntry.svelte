<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let formType = 'none'

	let inputName = ''
	let inputEmail = ''
	let inputPassword = ''
	let errorMessage = ''

	export const signUp = async () => {
		const response = await fetch('/auth/signup', {
			method: 'POST',
			body: JSON.stringify({
				name: inputName,
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

<div class="user-entry">
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
			}}>&#10006;</button>
	</div>

	{#if errorMessage}
		<div class="error-message"><p>{errorMessage}</p></div>
	{/if}

	<form class="entry-form">
		<div class="prompt-message">
			{#if formType === 'deleteAccount'}
				<p>Please confirm your account credentials.</p>
			{/if}
		</div>

		{#if formType === 'signUp'}
			<div>
				<div><label for="name-input">Name</label></div>
				<div><input id="name-input" type="text" bind:value={inputName} /></div>
			</div>
		{/if}

		<div>
			<div><label for="email-input">Email</label></div>
			<div><input id="email-input" type="email" bind:value={inputEmail} /></div>
		</div>

		<div class="prompt-message">
			{#if formType === 'signUp'}
				<p>Password must have one lowercase, uppercase, number and be 8+ characters.</p>
			{/if}
		</div>

		<div>
			<div><label for="password-input">Password</label></div>
			<div><input id="password-input" type="password" bind:value={inputPassword} /></div>
		</div>

		{#if formType === 'signUp'}
			<button on:click={signUp} type="button" class="btn submit-form-buttons">Sign Up</button>
		{:else if formType === 'logIn'}
			<button on:click={logIn} type="button" class="btn submit-form-buttons">Log In</button>
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
	.user-entry {
		position: absolute;
		margin: 22vh 0 0 0;
		width: 420px;
		left: calc(50% - 210px);
		padding: 20px;
		background-color: #fff;
		border-radius: 4px;
		color: var(--text-color);
		font-weight: 600;
		z-index: 100;
	}

	.user-entry p {
		font-weight: 700;
		font-size: 0.94rem;
		color: #555;
		margin: 0;
	}

	.entry-form {
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
		margin-top: 0.8rem;
	}

	.entry-form > div {
		width: 80%;
	}

	.error-message {
		margin-bottom: 0.5rem;
	}

	.error-message p {
		color: #ff0000;
	}

	.prompt-message p {
		margin-top: 1rem;
		margin-bottom: 0.8rem;
		color: #555;
	}

	input {
		margin: 0.5rem 0 1.4rem 0;
		padding: 0.2rem 0.6rem;
		outline: none;
		border: 2px solid var(--color-grey-13);
		background-color: var(--color-grey-13);
		border-radius: 0.4rem;

		transition: ease-in 0.1s;
		width: calc(100% - 1.2rem - 2px);
	}

	input:hover {
		outline: none;
		border: 2px solid var(--color-grey-11);
	}

	input:focus {
		outline: none;
		border: 2px solid var(--accent-color);
		background-color: #fff;
	}

	.submit-form-buttons {
		margin-top: 10px;
		width: 100%;
		color: #fff;
		background-color: var(--accent-color);
	}

	.submit-form-buttons:hover {
		background-color: var(--accent-color-darker);
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

	.hello ul {
		margin: 0 0 1rem 0;
		width: 100%;
	}

	.tab-btns {
		color: var(--text-color);
		font-weight: 600;
		background: none;
		border: none;
		padding: 0 0 3px 0;
		margin: 0 10px 0 0;
	}

	.selected {
		color: var(--accent-color);
		border-bottom: 2px solid var(--accent-color);
	}

	.close-form-btn {
		justify-content: flex-end;
		border: 0;
		background: none;
		color: var(--color-grey-8);
		font-weight: 700;
		font-size: 1rem;
		height: 1rem;
		width: 1rem;
		padding: 0;
	}

	.close-form-btn:hover {
		color: var(--color-grey-6);
	}
</style>
