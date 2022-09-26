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

<div class=" user-entry font-semibold absolute max-w-xs sm:max-w-lg w-screen bg-stone-100 dark:bg-stone-800 shadow-md z-20 top-24 p-4 rounded-xl">
	<div class="hello flex place-content-between h-6 mb-6">
		<ul class="flex relative list-none mb-4">
			{#if formType === 'signUp' || formType === 'logIn'}
				<li>
					<button
						class="tab-btns mr-4 {formType === 'signUp' ? 'text-red-500' : ''}"
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
						class="tab-btns  {formType !== 'signUp' ? 'text-red-500' : ''}"
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
					<button class="tab-btns" class:selected={formType === 'deleteAccount'}>Delete Account</button>
				</li>
			{/if}
		</ul>

		<button
			class="close-form-btn place-self-end "
			on:click={() => {
				formType = 'none'
			}}>&#10006;</button>
	</div>

	{#if errorMessage}
		<div class="error-message text-red-500 mb-2"><p>{errorMessage}</p></div>
	{/if}

	<form class="entry-form flex flex-col place-items-center">
		<div class="prompt-message">
			{#if formType === 'deleteAccount'}
				<p>Please confirm your account credentials.</p>
			{/if}
		</div>

		{#if formType === 'signUp'}
			<div>
				<div><label for="name-input">Name</label></div>
				<div>
					<input
						class="mb-2 mt-1 py-1 semibold rounded-lg pl-4 font-semibold placeholder:text-stone-400 dark:bg-stone-600 shadow-sm 
					focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
						id="name-input"
						type="text"
						bind:value={inputName} />
				</div>
			</div>
		{/if}

		<div>
			<div><label for="email-input">Email</label></div>
			<div>
				<input
					class="mb-2 mt-1 py-1 semibold rounded-lg pl-4 font-semibold placeholder:text-stone-400 dark:bg-stone-600 shadow-sm 
				focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
					id="email-input"
					type="email"
					bind:value={inputEmail} />
			</div>
		</div>

		<div class="prompt-message">
			{#if formType === 'signUp'}
				<p class="mx-4 my-3">Password must have one lowercase, uppercase, number and be 8+ characters.</p>
			{/if}
		</div>

		<div>
			<div><label for="password-input">Password</label></div>
			<div>
				<input
					class="mb-2 mt-1  py-1 semibold rounded-lg pl-4 font-semibold placeholder:text-stone-400 dark:bg-stone-600 shadow-sm 
				focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500"
					id="password-input"
					type="password"
					bind:value={inputPassword} />
			</div>
		</div>

		{#if formType === 'signUp'}
			<button on:click={signUp} type="button" class="mt-2 bg-stone-200 dark:bg-stone-700 font-semibold rounded-lg h-10 px-4">Sign Up</button>
		{:else if formType === 'logIn'}
			<button on:click={logIn} type="button" class="mt-2 bg-stone-200 dark:bg-stone-700 font-semibold rounded-lg h-10 px-4">Log In</button>
		{:else if formType === 'deleteAccount'}
			<button on:click={dispatchCredentials} type="button" class="bg-red-500 dark:bg-stone-500 font-semibold rounded-lg h-10 px-4"> Delete Account </button>
		{/if}
	</form>
</div>
