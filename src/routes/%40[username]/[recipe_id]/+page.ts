import type { Recipe } from '$lib/types'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url }) => {
	const { username, recipe_id } = params

	const res = await fetch(
		`${url.origin}/recipe?type=one&username=${username}&id=${recipe_id}`,
		{ method: 'GET' }
	)

	const { recipe }: { recipe: Recipe } = await res.json()

	if (recipe) {
		return {
			username,
			recipe
		}
	} else {
		throw new Error('Recipe not found.')
	}

}