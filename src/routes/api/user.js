import { mongoClient } from '$lib/db'

export const prerender = true

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
		// TODO: check if this is vulnerable to double posting
		let newMongoUser = {
			id: id,
			name: id.split('@')[0],
			email: id,
			avatar: 'https://www.fillmurray.com/' + (Math.floor(32 + Math.random() * 96) + '/').repeat(2)
		}
		await mongoClient.db('recipow').collection('users').insertOne(newMongoUser)

	}

	return {
		status: 500,
		body: {
			message: "End of control reached"
		}
	}
}

/** @type {import('../api/__types/user').RequestHandler} */
export const patch = async ({ request }) => {
	const { type, id, newName, newAvatar
	} = await request.json()

	if (type == "updateUser") {
		console.log(newName);
		const res = await mongoClient.db('recipow').collection('users').updateOne(
			{ "id": id },
			{ $set: { "name": newName, "avatar": newAvatar } }
		)

		console.log(res);
		if (res.matchedCount == 1) {
			return {
				status: 200,
				body: {
					message: "Matched with user"
				}
			}
		}
	}

	return {
		status: 400,
		body: {
			message: 'bad bad bad'
		}
	}
}