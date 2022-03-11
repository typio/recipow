<script>
  import { session } from '$app/stores'
  import { browser } from '$app/env'
  // import { goto } from "$app/navigation"

  import SignIn from '$lib/components/SignIn.svelte'

  let show_form = false
  let show_signup = true

  if (browser) {
    $session
  }

  const signOut = () => {
    return
  }
</script>



<nav>
  <a href="/">Home</a>
  <button
    on:click={() => {
      show_form = true
      show_signup = true
    }}>Sign Up</button
  >
  <button
    on:click={() => {
      show_form = true
      show_signup = false
    }}>Sign In</button
  >
  <a href="/profile">Profile</a>
  <button on:click={signOut}>Log Out</button>
</nav>


<div
  class="sign-form-overlay"
  style="display: {show_form ? 'block' : 'none'}"
  on:click={() => {
    show_form = false
  }}
/>

<div class="sign-form">
  <SignIn bind:show_form bind:show_signup />
</div>

<slot />




<style>
  :global(body) {
    margin: 0;
  }

  .sign-form {
    position: absolute;
    width: 500px;
    top: calc(50% - 250px);
    left: calc(50% - 250px);
    ;
  }

  .sign-form-overlay {
    position:absolute;
    margin: 0;
    top: 0;

    width: 100%;
    height: 100%;
    background-color: hsla(0, 0%, 0%, 40%);
  }
</style>
