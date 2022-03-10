<script>
  import supabase from "$lib/db.js"

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

profile

<div>
  <label for="fname-entry">First Name:</label>
  <input id="fname-entry" type="text" bind:value={fname} />

  <label for="lname-entry">Last Name:</label>
  <input id="lname-entry" type="text" bind:value={lname} />

  <label for="pfp-entry">Profile Picture:</label>
  <input id="pfp-entry" type="file" accept="image/*" bind:value={avatar} />

  <label for="website-entry">Website:</label>
  <input id="website-entry" type="text" bind:value={website} />
</div>
