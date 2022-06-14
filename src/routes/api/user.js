import { mongoClient } from '$lib/db'

/** @type {import('../api/__types/user').RequestHandler} */
export const post = async ({ request }) => {
	const { type, id } = await request.json()

	if (type == "getUser") {

		const user = await mongoClient.db('recipow').collection('users').findOne({ "id": id }) || undefined

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
		}

		return {
			status: 500,
			body: {
				message: 'User not found'
			}
		}
	}

	if (type == "createUser") {
		
	}
}

/** @type {import('../api/__types/user').RequestHandler} */
export const patch = async ({ request }) => {
	return {
		status: 400,
		body: {
			message: 'bad bad bad'
		}
	}
}