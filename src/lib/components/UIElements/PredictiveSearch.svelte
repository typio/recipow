<script>
	export let optionList

	let searchInput
	let filteredOptions

    let placeholder
</script>

<form autocomplete="off" on:submit|preventDefault={submitValue}>
	<div class="autocomplete">
		<input
			id="search-input"
			type="text"
			placeholder="Search Country Names"
			bind:this={searchInput}
			bind:value={inputValue}
			on:input={filteredOptions} />
	</div>

	<input type="submit" />

	{#if filteredOptions.length > 0}
		<ul id="autocomplete-items-list">
			{#each filteredOptions as option, i}
				<li on:click={() => setInputVal(option)}>{option}</li>
			{/each}
		</ul>
	{/if}
</form>

<style>
</style>
