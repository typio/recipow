import * as cookie from 'cookie'
import { redis, mongoClient } from '$lib/db'

import type { Handle, GetSession } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	// this results in a lot of queries

	const cookies = cookie.parse(event.request.headers.get('cookie') || '')

	const email = JSON.parse((await redis.get(cookies.sessionId)) || '{}').email

	if (email != undefined) {
		const mongoResult = await mongoClient
			.db('recipow')
			.collection('users')
			.findOne({ email }, { projection: { _id: 0 } })

		event.locals.user = mongoResult
	} else {
		event.locals.user = null
	}

	return await resolve(event)
}

export const getSession: GetSession = async ({ locals }) => {
	return {
		user: locals.user
	}
}
