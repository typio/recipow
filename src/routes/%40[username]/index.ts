import { mongoClient } from '$lib/db'

export const get = async ({ params }) => {
	const user = await mongoClient
		.db('recipow')
		.collection('users')
		.findOne({ username: params.username })

	const { recipes } = await mongoClient
		.db('recipow')
		.collection('users')
		.findOne({ username: params.username })

	if (user) {
		return {
			status: 200,
			body: {
				user,
				recipes
			}
		}
	}

	return {
		status: 404,
		body: {
			message: 'User not found'
		}
	}
}
