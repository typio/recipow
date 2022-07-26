<script>
	import TipTapEditor from '$lib/components/header/TipTapEditor.svelte'
</script>

<div class="content">
	<div class="recipe-card-input">
		<div class="recipe-header-input">
			<input class="recipe-title" type="text" placeholder="Recipe Title" />
			<input class="recipe-description" type="text" placeholder="Description" />
			<input class="recipe-cover-photo" type="file" name="" id="" />
		</div>

		<div>
			<h3>Ingredients:</h3>
			<input type="text" placeholder="" />
			<button>+</button>
		</div>

		<div>
			<h3>Instructions:</h3>
			<input type="text" placeholder="" />
			<button>+</button>
		</div>

		<div>
			<h3>Times:</h3>
			<input type="text" placeholder="Prep Time" />
			<input type="number" />
			<input type="text" placeholder="Cook Time" />
			<input type="number" />
			<input type="text" placeholder="Total Time" />
			<input type="number" />
			<button>+</button>
		</div>

		<div>
			<input type="text" placeholder="Servings" />
			<input type="text" placeholder="Makes: 12in pizza pie" />
			<input type="text" placeholder="Notes" />
		</div>
	</div>

	<div>
		<h3>Write Up:</h3>
		<TipTapEditor />
	</div>

	<select name="" id="">
		<option value="public">Public</option>
		<option value="unlisted">Unlisted</option>
		<option value="private">Private</option>
	</select>

	<button class="btn" on:click={() => {}}>Post Recipe</button>
</div>

<style>
	.content {
	}

	.recipe-card-input {
		margin-top: 5vh;
		border: #eee solid 3px;
		border-radius: 0.4rem;
		padding: 2rem;
	}

	.recipe-header-input {
		display: grid;
		grid-template-columns: 3fr 2fr;
		grid-template-rows: 1fr 1fr;
		gap: 1rem 4rem;
	}

	.recipe-title {
		grid-column: 1;
		grid-row: 1;
	}

	.recipe-description {
		grid-column: 1;
		grid-row: 2;
	}

	.recipe-cover-photo {
		grid-column: 2;
		grid-row: 1 / 3;
	}

	input[type='file'] {
		background-color: #eee;
	}

	input[type='text'] {
		border: none;
		border-bottom: 1px solid #ccc;
		padding: 10px;
		width: 100%;
	}

	input[type='text']:focus {
		outline: none;
		border-bottom: 1px solid #000;
	}
</style>
