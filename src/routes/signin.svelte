<script>
  import supabase from '$lib/db.js'
  import { session } from '$app/stores'

  let email, password

  async function signUp() {
    const {
      user,
      
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    })
    console.log('Sign Up', user,  error)
  }

  async function signIn() {
    const {
      user,
      
      error,
    } = await supabase.auth.signIn({
      email,
      password,
    })
    console.log('Sign In', user,  error)
  }
</script>

sign up / sign in

<div class="signup-form">
  <label for="email-entry">Email:</label>
  <input id="email-entry" type="email" bind:value={email} />

  <label for="password-entry">Password:</label>
  <input id="password-entry" type="password" bind:value={password} />

  <button on:click={signUp}> Sign Up </button>
</div>

<form class="signin-form">
  <label for="email-entry">Email:</label>
  <input id="email-entry" type="email" bind:value={email} />

  <label for="password-entry">Password:</label>
  <input id="password-entry" type="password" bind:value={password} />
  <button on:click={signIn}> Sign In </button>
</form>
