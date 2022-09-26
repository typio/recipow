import * as cookie from 'cookie'

import { redis } from '$lib/db'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	const previousSID = cookie.parse(request.headers.get('cookie') || '').sessionId

	await redis.del(previousSID)

	return new Response(
		JSON.stringify({
			message: 'User logged out successfully'
		}),
		{
			status: 200,
			headers: {
				'Set-Cookie': cookie.serialize('sessionId', previousSID, {
					path: '/',
					httpOnly: true,
					maxAge: -1,
					sameSite: 'strict',
					secure: true
				})
			}
		}
	)
}
