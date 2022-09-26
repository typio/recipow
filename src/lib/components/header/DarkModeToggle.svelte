<script lang="ts">
	import sunEmoji from '$lib/assets/sun-emoji.svg'
	import moonEmoji from '$lib/assets/moon-emoji.svg'

	import { writable } from 'svelte/store'
	import { browser } from '$app/env'

	const defaultValue = 'light'
	const initialValue = browser ? window.localStorage.getItem('theme') ?? defaultValue : defaultValue

	export const theme = writable<string>(initialValue)

	theme.subscribe(value => {
		if (browser) {
			window.localStorage.setItem('theme', value)
		}
	})

	if ($theme === 'dark') document.getElementsByTagName('html')[0].setAttribute('class', 'dark')
</script>

<div class="switch flex rounded-full shadow-md p-1 sm:px-3 bg-stone-100 dark:bg-stone-800">
	<button
		class="brightness-100 dark:brightness-50 transition-all"
		on:click={() => {
			theme.set('light')
			document.getElementsByTagName('html')[0].setAttribute('class', 'light')
		}}>
		<img class="w-8" src={sunEmoji} alt="Light Mode" />
	</button>
	<button
		class="brightness-50 dark:brightness-100 transition-all"
		on:click={() => {
			theme.set('dark')
			document.getElementsByTagName('html')[0].setAttribute('class', 'dark')
		}}>
		<img class="w-8" src={moonEmoji} alt="Dark Mode" />
	</button>
</div>
