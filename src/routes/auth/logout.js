import * as cookie from 'cookie'

import { redis } from '$lib/db'

/** @type {import('../auth/__types/logout').RequestHandler} */
export const post = async ({ request }) => {
    const previousSID = cookie.parse(request.headers.get('cookie') || '').sessionId

    await redis.del(previousSID)
    
    return {
        status: 200,
        body: {
            message: 'User logged out successfully'
        },
        headers: {
            'Set-Cookie': cookie.serialize(
                'sessionId',
                previousSID,
                {
                    path: '/',
                    httpOnly: true,
                    maxAge: -1,
                    sameSite: 'strict',
                    secure: true
                }
            )
        }
    }
}