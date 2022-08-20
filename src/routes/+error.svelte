<script context="module" lang="ts">
	import type { Load } from '.svelte-kit/types/src/routes/__types/__error'

	export const load: Load = ({ status, error }) => {
		return {
			props: {
				title: `${status}: ${error.message}`
			}
		}
	}
</script>

<script lang="ts">
	export let title: string
</script>

<h1>{title}</h1>
