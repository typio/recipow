// import * as cookie from 'cookie'
// import { redis, mongoClient } from '$lib/db'

// import type { Handle, GetSession } from '@sveltejs/kit'
// import ipLocation from 'iplocation'

// export const handle: Handle = async ({ event, resolve }) => {
// 	// this results in a lot of queries

// 	const cookies = cookie.parse(event.request.headers.get('cookie') || '')

// 	const email = JSON.parse((await redis.get(cookies.sessionId)) || '{}').email

// 	if (email != undefined) {
// 		const mongoResult = await mongoClient
// 			.db('recipow')
// 			.collection('users')
// 			.findOne({ email }, { projection: { _id: 0 } })

//         event.locals.user = mongoResult
// 	} else {
//         event.locals.user = null
// 	}

// 	return await resolve(event)
// }

// export const getSession: GetSession = async ({ locals, clientAddress }) => {
// 	if ((await mongoClient
// 		.db('recipow')
// 		.collection('ips')
// 		.find({ ip: clientAddress }).toArray()).length === 0) {
// 		await mongoClient.db('recipow').collection('ips').insertOne({ ip: clientAddress, location: await ipLocation(clientAddress), createdAt: new Date().toISOString() })
// 	} else {
// 		await mongoClient.db('recipow').collection('ips').updateOne(
// 			{ ip: clientAddress }, { $set: { lastSeen: new Date().toISOString() } }
// 		)
// 	}
// 	return {
// 		user: locals.user
// 	}
// }
