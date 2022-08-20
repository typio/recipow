<script lang="ts">
	let highlights = [false, false, false]
</script>

<svelte:head>
	<title>About</title>
</svelte:head>

<div class="content">
	<h1>About Recipow</h1>

	<h2>The first fighting themed recipe website!</h2>
	<h5>
		> For bodyguards by bodyguards
		<sup
			on:mouseenter={() => {
				highlights[0] = true
			}}
			on:mouseleave={() => {
				highlights[0] = false
			}}>*</sup>

		<sup
			on:mouseenter={() => {
				highlights[1] = true
			}}
			on:mouseleave={() => {
				highlights[1] = false
			}}>**</sup>
	</h5>
	<p>
		Online at <a href="https://recipow.com">recipow.com</a><sup
			on:mouseenter={() => {
				highlights[2] = true
			}}
			on:mouseleave={() => {
				highlights[2] = false
			}}>***</sup
		>!
	</p>

	<h6
		style="color: {!highlights[0]
			? 'var(--color-grey-7)'
			: 'var(--accent-color)'} ; font-size: {!highlights[0] ? '.7rem' : '2rem'}"
		on:mouseenter={() => {
			highlights[0] = true
		}}
		on:mouseleave={() => {
			setTimeout(() => {
				highlights[0] = false
			}, 200)
		}}>
		<sup>*</sup>Website is not made by bodyguards
	</h6>
	<h6
		style="color: {!highlights[1]
			? 'var(--color-grey-7)'
			: 'var(--accent-color)'} ; font-size: {!highlights[1] ? '.7rem' : '2rem'}"
		on:mouseenter={() => {
			highlights[1] = true
		}}
		on:mouseleave={() => {
			setTimeout(() => {
				highlights[1] = false
			}, 200)
		}}>
		<sup>**</sup>Website can also be used by bodybuilders
	</h6>

	<h6
		style="color: {!highlights[2]
			? 'var(--color-grey-7)'
			: 'var(--accent-color)'} ; font-size: {!highlights[2] ? '.7rem' : '2rem'}"
		on:mouseenter={() => {
			highlights[2] = true
		}}
		on:mouseleave={() => {
			setTimeout(() => {
				highlights[2] = false
			}, 200)
		}}>
		<sup>***</sup>Website is in development and any data you upload should be considered unsafe/
		unstable. It may also be running a faulty dev build.
	</h6>

	<p>
		Please share your yummy recipies whether they be generational treasures or your own concoction,
		and try cooking something out of our abundant catalouge!
	</p>
	<p>
		This is a website for bodyguards to share their fighting themed recipes. 🔥 Even if you aren't a
		bodyguard, please sign up and create a recipe. 💯 I'm creating this website to gain experience
		in fullstack web dev, and to make the best recipe website online!!! 🚀 If you have any
		suggestions please email me at <a href="mailto:tohuber" target="_blank">me@tohuber.com</a>! 🙏
	</p>
</div>

<style>
	.content {
		width: 100%;
		width: fit-content;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}

	sup {
		font-size: 0.8rem;
	}

	h2 {
		text-align: left;
		margin-bottom: 0rem;
		font-weight: 500;
	}

	h5 {
		color: var(--color-grey-7);
		margin: 0 0 0 1rem;
		font-weight: 500;
	}

	h6 {
		margin: 0 0 0 2rem;
		color: var(--color-grey-7);
		transition: cubic-bezier(0.075, 0.82, 0.165, 1) 0.2s;
		font-weight: 500;
	}
</style>
