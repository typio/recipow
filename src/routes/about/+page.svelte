<script lang="ts">
	let highlights = [false, false, false]
</script>

<svelte:head>
	<title>About</title>
</svelte:head>

<div class="content leading-6 mx-4">
	<h1 class="text-2xl mb-12 text-center font-bold">About Recipow</h1>

	<h2 class="font-bold">The first power themed recipe website!</h2>
	<h5 class="ml-8 mb-4">
		For bodybuilders by bodybuilders<sup
			on:mouseenter={() => {
				highlights[0] = true
			}}
			on:mouseleave={() => {
				highlights[0] = false
			}}>*</sup>
	</h5>
	<p>
		Online at <a href="https://recipow.com">recipow.com</a><sup
			on:mouseenter={() => {
				highlights[1] = true
			}}
			on:mouseleave={() => {
				highlights[1] = false
			}}>**</sup
		>!
	</p>

	<h6
        class="ml-8 mt-4 leading-8 "
		style="color: {!highlights[0] ? 'var(--color-grey-7)' : 'var(--accent-color)'} ; font-size: {!highlights[0] ? '.7rem' : '2rem'}"
		on:mouseenter={() => {
			highlights[0] = true
		}}
		on:mouseleave={() => {
			setTimeout(() => {
				highlights[0] = false
			}, 200)
		}}>
		<sup class="text-2xl leading-none">*</sup>Website is also for everyone else
	</h6>

	<h6
        class="ml-8 mt-4 leading-8"
		style="color: {!highlights[1] ? 'var(--color-grey-7)' : 'var(--accent-color)'} ; font-size: {!highlights[1] ? '.7rem' : '2rem'}"
		on:mouseenter={() => {
			highlights[1] = true
		}}
		on:mouseleave={() => {
			setTimeout(() => {
				highlights[1] = false
			}, 200)
		}}>
		<sup class="text-2xl leading-none">**</sup>Website is in development and any data you upload should be considered unsafe/ unstable. It may also be running a faulty dev build.
	</h6>

	<p class="mt-2 mb-4 indent-8">Please share your yummy recipies whether they be generational treasures or your own concoction, and try cooking something out of our abundant catalouge!</p>
	<p class="indent-8">
		This is a website for bodybuilders to share their power themed recipes. 🔥 Even if you aren't a bodybuilder, please sign up and create a recipe. 💯 I'm creating this website to gain experience in fullstack web dev, and to make the best
		recipe website online!!! 🚀 If you have any suggestions please email me at <a href="mailto:tohuber" target="_blank">me@tohuber.com</a>! 🙏
	</p>
</div>

<style>
	h6 {
		transition: cubic-bezier(0.075, 0.82, 0.165, 1) 0.2s;
	}
</style>
