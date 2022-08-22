import { mongoClient } from '$lib/db'

export const load = async ({ params, parent }) => {
	const { username, recipe_id } = params

	const pageUser = await mongoClient
		.db('recipow')
		.collection('users')
		.findOne({ username: params.username }, {projection: {_id: 0, recipes: 0, ip: 0}})
	
	return {pageUser}
}