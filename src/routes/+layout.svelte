<script lang="ts">
	import Header from '$lib/components/header/Header.svelte'
	import '../app.css'
	import Analytics from '$lib/components/Analytics.svelte'
</script>

<svelte:head>
	<script>
		if (window.localStorage.getItem('theme') === 'dark') {
			document.getElementsByTagName('html')[0].setAttribute('class', 'dark')
			theme.set('dark')
		}
	</script>
</svelte:head>

<Analytics />

<Header />

<main class="flex flex-col max-w-sm sm:max-w-lg md:max-w-lg lg:max-w-4xl xl:max-w-5xl 2xl:max-w-7xl mx-auto">
	<slot />
</main>

<footer class="">
	<ul class="max-w-sm mx-auto my-8 flex flex-row flex-wrap place-content-around text-center">
		<li><a class="font-bold px-2 leading-9" sveltekit:prefetch href="/about">About</a></li>
		<li><a class="font-bold px-2 leading-9" sveltekit:prefetch href="/help">Help</a></li>
		<li><a class="font-bold px-2 leading-9" sveltekit:prefetch href="/privacy">Privacy</a></li>
		<li><a class="font-bold px-2 leading-9" sveltekit:prefetch href="/terms">Terms</a></li>
		<li><a class="font-bold px-2 leading-9" sveltekit:prefetch href="/contact">Contact</a></li>
	</ul>
</footer>

<style>
</style>
