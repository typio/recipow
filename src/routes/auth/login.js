import * as cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid'
import stringHash from 'string-hash'

import { redis } from '$lib/db'
import { validateEmail, validatePassword, TOKEN_EXPIRE_TIME } from './helper'

/** @type {import('../auth/__types/login').RequestHandler} */
export const post = async ({ request }) => {
    const { email, password } = await request.json()

    const previousSID = cookie.parse(request.headers.get('cookie') || '').sessionId

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

    // no need to check email i think, bc user will be {} if email not in redis
    if (user.passwordHash != hash) {
        return {
            status: 400,
            body: {
                message: 'Invalid email or password'
            }
        }
    }

    // if user already logged in dont create new cookie
    if (await redis.get(previousSID)) {
        // refresh expire time on redis and local cookie
        await redis.set(
            previousSID,
            JSON.stringify({
                email
            }),
            'EX',
            TOKEN_EXPIRE_TIME
        )
        return {
            status: 200,
            body: {
                message: 'User validated successfully (already logged in)'
            },
            headers: {
                'Set-Cookie': cookie.serialize(
                    'sessionId',
                    previousSID,
                    {
                        path: '/',
                        httpOnly: true,
                        maxAge: TOKEN_EXPIRE_TIME,
                        sameSite: 'strict',
                        secure: true
                    }
                )
            }
        }
    }

    await redis.set(
        cookieId,
        JSON.stringify({
            email
        }),
        'EX',
        TOKEN_EXPIRE_TIME
    )

    return {
        status: 200,
        headers: {
            'Set-Cookie': cookie.serialize('sessionId', cookieId, {
                path: '/',
                httpOnly: true,
                maxAge: TOKEN_EXPIRE_TIME,
                sameSite: 'strict',
                secure: true
            })
        },
        body: {
            message: 'User validated successfully',
        }
    }
}