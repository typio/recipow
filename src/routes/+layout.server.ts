import * as cookie from 'cookie'
import { redis, mongoClient } from '$lib/db'

import ipLocation from 'iplocation'

import type { LayoutServerLoad } from './$types'
import type { User } from '$lib/types'

export const load: LayoutServerLoad = async ({ request, clientAddress }) => {
	const cookies = cookie.parse(request.headers.get('cookie') || '')

	const email = JSON.parse((await redis.get(cookies.sessionId)) || '{}').email

	// log IP address
	if ((await mongoClient.db('recipow').collection('ips').find({ ip: clientAddress }).toArray()).length === 0) {
		await mongoClient
			.db('recipow')
			.collection('ips')
			.insertOne({
				ip: clientAddress,
				location: await ipLocation(clientAddress),
				createdAt: new Date().toISOString(),
				lastSeen: new Date().toISOString()
			})
	} else {
		await mongoClient
			.db('recipow')
			.collection('ips')
			.updateOne({ ip: clientAddress }, { $set: { lastSeen: new Date().toISOString() } })
	}

	// return user if logged in
	if (email != undefined) {
		const user = await mongoClient
			.db('recipow')
			.collection('users')
			.findOne<User>({ email }, { projection: { _id: 0, recipes: 0 } })

		if (user?.email) {
			return {
				user
			}
		}
	}

	return {
		user: null
	}
}
