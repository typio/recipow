<script>
	import { SvelteToast } from '@zerodevx/svelte-toast'
	import Header from '$lib/components/header/Header.svelte'
	import '../app.css'
</script>

<Header />

<SvelteToast />

<main>
	<slot />
</main>

<footer>
	<ul>
		<li><a sveltekit:prefetch href="/about">Help</a></li>
		<li><a sveltekit:prefetch href="/about">About</a></li>
		<li><a sveltekit:prefetch href="/about">Privacy</a></li>
		<li><a sveltekit:prefetch href="/about">Terms</a></li>
		<li><a sveltekit:prefetch href="/about">Contact</a></li>
	</ul>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer ul {
		width: 24%;
		position: relative;
		padding: 0;
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
		text-overflow: ellipsis;
		flex-wrap: wrap;
	}

	footer li {
		position: relative;
		height: 100%;
		display: flex;
		align-items: center;
		padding-right: 1rem;
		font-size: .9rem;
		line-height: 2rem;
	}

	footer li a {
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
