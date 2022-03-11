<script>
  import { session } from '$app/stores'

  let fname, lname, avatar, website

  //   const updateProfile = async () => {
  //     const { user, session, error } = await supabase.auth.signUp({
  //       data: {
  //         fname,
  //         lname,
  //         avatar,
  //         website,
  //       },
  //     })
  //     console.log(user, error)
  //   }
</script>

<h2>profile</h2>

<div>
  <label for="fname-entry">First Name:</label>
  <input id="fname-entry" type="text" bind:value={fname} />

  <label for="lname-entry">Last Name:</label>
  <input id="lname-entry" type="text" bind:value={lname} />

  <label for="pfp-entry">Profile Picture:</label>
  <input id="pfp-entry" type="file" accept="image/*" bind:value={avatar} />

  <label for="website-entry">Website:</label>
  <input id="website-entry" type="text" bind:value={website} />

  <button>Update Profile</button>
</div>

<pre style="width: 80vw; height: 80vh;">
    <code>
      {JSON.stringify($session, null, 2)}
    </code>
  </pre>
