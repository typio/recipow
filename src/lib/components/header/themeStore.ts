import { writable } from 'svelte/store'
	import { browser } from '$app/environment'

	const defaultValue = 'light'
	const initialValue = browser ? window.localStorage.getItem('theme') ?? defaultValue : defaultValue

	export const theme = writable<string>(initialValue)

	theme.subscribe(value => {
		if (browser) {
			window.localStorage.setItem('theme', value)
		}
	})