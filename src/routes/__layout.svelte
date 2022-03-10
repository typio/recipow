<script>
  import supabase from "$lib/db.js"
  import { session } from "$app/stores"
  import { browser } from "$app/env"
  // import { goto } from "$app/navigation"

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    console.log("Sign Out", error);
  }

  if (browser) {
    $session = supabase.auth.session()
    // setTimeout(() => $session ?? false ? goto("/") : goto("/signin"))
    supabase.auth.onAuthStateChange((event, user_session) => {
      $session = user_session
    })
  }
</script>

<nav>
  <a href="/">Home</a>
  <a href="/signin">Sign Up/ Sign In</a>
  <a href="/profile">Profile</a>
  <button on:click={signOut}>Log Out</button>
</nav>

<slot />

<pre style="width: 80vw; overflow:scroll;">
  <code>
    {JSON.stringify($session, null, 2)}
  </code>
</pre>

<style>
</style>
