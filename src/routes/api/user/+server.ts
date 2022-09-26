import { mongoClient } from '$lib/db'
import type { User } from '$lib/types'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url: { searchParams } }: { url: URL }) => {
	const username = searchParams.get('username') || ''

	const user = await mongoClient
		.db('recipow')
		.collection('users')
		.findOne<User>({ username }, { projection: { _id: 0, recipes: 0, ip: 0 } })

	if (user) {
		return new Response(JSON.stringify(user), { status: 200 })
	} else {
		return new Response(JSON.stringify(null), { status: 404 })
	}
}
