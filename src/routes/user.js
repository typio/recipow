import { session } from '$app/stores'
import { redis, mongoClient } from '$lib/db'

/** @type {import('./__types/user').RequestHandler} */
export const post = async ({ request }) => {
	const { id } = await request.json()

	const user = await mongoClient.db('recipow').collection('users').findOne({ "id": id })

	if (user) {
		return {
			body: {
				id: user.id,
				name: user.name,
				email: user.email,
				avatar: user.avatar

			},
			status: 200
		}
	} else {
		return {
			status: 500,
			body: {
				message: 'User not found'
			}
		}
	}
}

/** @type {import('./__types/auth').RequestHandler} */
export const patch = async ({ request }) => {
	return {
		status: 400,
		body: {
			message: 'bad bad bad'
		}
	}
}