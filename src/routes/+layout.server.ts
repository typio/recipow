import * as cookie from 'cookie'
import { redis, mongoClient } from '$lib/db'

import ipLocation from 'iplocation'

import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ request, clientAddress }) => {
    const cookies = cookie.parse(request.headers.get('cookie') || '')

    const email = JSON.parse((await redis.get(cookies.sessionId)) || '{}').email

    // log IP address
    if ((await mongoClient
        .db('recipow')
        .collection('ips')
        .find({ ip: clientAddress }).toArray()).length === 0) {
        await mongoClient.db('recipow').collection('ips').insertOne({ ip: clientAddress, location: await ipLocation(clientAddress), createdAt: new Date().toISOString() })
    } else {
        await mongoClient.db('recipow').collection('ips').updateOne(
            { ip: clientAddress }, { $set: { lastSeen: new Date().toISOString() } }
        )
    }

    // return user if logged in
    if (email != undefined) {
        const mongoResult = await mongoClient
            .db('recipow')
            .collection('users')
            .findOne({ email }, { projection: { _id: 0, recipes: 0 } })

        if (mongoResult?.email) {
            return {
                user: mongoResult
            }
        }
    }

    return {
        user: null
    }
}