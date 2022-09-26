<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let color = 'hsla(0, 0%, 0%, 40%)'

	const clicked = () => {
		dispatch('clicked')
	}
</script>

<div class="overlay z-10 absolute w-screen h-screen top-0 left-0" style={'background-color:' + color} on:click={clicked} />
