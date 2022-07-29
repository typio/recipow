import * as cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid'
import stringHash from 'string-hash'

import { redis, mongoClient } from '$lib/db'
import { validateEmail, validatePassword, TOKEN_EXPIRE_TIME } from './helper'


/** @type {import('../auth/__types/signup').RequestHandler} */
export const post = async ({ request }) => {
    const { email, password } = await request.json()

    if (!validateEmail(email)) {
        return {
            status: 400,
            body: {
                message: 'Invalid email'
            }
        }
    }

    if (!validatePassword(password)) {
        return {
            status: 400,
            body: {
                message: 'Invalid password'
            }
        }
    }

    /** @type {import('$lib/types').AuthUser} */
    const user = await (async () => {
        try {
            return JSON.parse((await redis.get(email)) || '{}')
        } catch (error) {
            console.log('Failed to parse JSON of redis value, error:', error)
            return {}
        }
    })()

    const hash = stringHash(password)
    const cookieId = uuidv4()

    if (user.email) {
        return {
            status: 400,
            body: {
                message: 'User with this email already exists'
            }
        }
    }

    // add user in redis
    await redis.set(
        email,
        JSON.stringify({
            email,
            passwordHash: hash
        })
    )

    // add cookie in redis
    await redis.set(
        cookieId,
        JSON.stringify({
            email
        }),
        'EX',
        TOKEN_EXPIRE_TIME
    )

    // add user in mongo
    let newMongoUser = {
        id: email,
        name: email.split('@')[0],
        email: email,
        avatar: 'https://www.fillmurray.com/' + (Math.floor(32 + Math.random() * 96) + '/').repeat(2)
    }
    await mongoClient.db('recipow').collection('users').insertOne(newMongoUser)

    // set cookie
    return {
        status: 200,
        headers: {
            'Set-Cookie': cookie.serialize(
                'sessionId',
                cookieId, {
                path: '/',
                httpOnly: true,
                maxAge: TOKEN_EXPIRE_TIME,
                sameSite: 'strict',
                secure: true
            })
        },
        body: {
            message: 'User created successfully'
        }
    }
}