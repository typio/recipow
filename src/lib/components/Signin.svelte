<script>
  // import { session } from '$app/stores'

  let signin_email, signin_password, signup_email, signup_password

  export let show_form = false
  export let show_signup = true

  async function signUp() {
    alert('sign up')
    //   const {
    //     user,
    //     error,
    //   } = await supabase.auth.signUp({
    //     email,
    //     password,
    //   })
    //   console.log('Sign Up', user, error)
  }

  async function signIn() {
    alert('sign in')
    //   const {
    //     user,
    //     error,
    //   } = await supabase.auth.signIn({
    //     email,
    //     password,
    //   })
    //   console.log('Sign In', user, error)
  }
</script>

<div class="form" style="display: {show_form ? 'block' : 'none'}">
  <button
    class="signup-signin-btns"
    on:click={() => {
      show_signup = true
    }}>Sign Up</button
  >
  <button
    class="signup-signin-btns"
    on:click={() => {
      show_signup = false
    }}>Sign In</button
  >

  <button
    class="close-form-btn"
    on:click={() => {
      show_form = false
    }}>X</button
  >
  <form class="signup-form" style="display: {show_signup ? 'block' : 'none'}">
    <label for="signup-email-input">Email:</label>
    <input id="signup-email-input" type="email" bind:value={signup_email} />

    <label for="signup-password-input">Password:</label>
    <input
      id="signup-password-input"
      type="password"
      bind:value={signup_password}
    />

    <button on:click={signUp}> Sign Up </button>
  </form>

  <form class="signin-form" style="display: {show_signup ? 'none' : 'block'}">
    <label for="signin-email-input">Email:</label>
    <input id="signin-email-input" type="email" bind:value={signin_email} />

    <label for="signin-password-input">Password:</label>
    <input
      id="signin-password-input"
      type="password"
      bind:value={signin_password}
    />
    <button on:click={signIn}> Sign In </button>
  </form>
</div>

<style>
  .form {
    
    /* positioning and size are in __layout.svelte */
    background-color: hsl(0, 0%, 90%);
  }

  .signup-form, .signin-form {
    display: block;
  }

  .signup-signin-btns {
    background: none;
    border: none;
    text-decoration: underline;
  }

  .close-form-btn {
  }
</style>
