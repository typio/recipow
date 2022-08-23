import { mongoClient } from '$lib/db'

import type { Recipe } from '$lib/types'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, parent, url }) => {
	const { username, recipe_id } = params
	const { user } = await parent()

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
		return {
			message: 'Recipe not found.',
			status: 404
		}
	}

}