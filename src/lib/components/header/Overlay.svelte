<script>
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let color = 'hsla(0, 0%, 0%, 40%)'

	const clicked = () => {
		dispatch('clicked')
	}
</script>

<div class="overlay" style={'background-color:' + color} on:click={clicked} />

<style>
	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 99;

		width: 100%;
		height: 100%;
	}
</style>
