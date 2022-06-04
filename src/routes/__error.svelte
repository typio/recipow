<script context="module">
	/**
	 * @param {Object} props
	 * @param {Error} props.error
	 * @param {number} props.status
	 */
	export function load({ error, status }) {
		return {
			props: {
				title: `${status}: ${error.message}`
			}
		};
	}
</script>

<script>
	/**
	 * @type {string}
	 */
	export let title;
</script>

<h1>{title}</h1>
