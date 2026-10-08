import * as cookie from 'cookie'
import type { RowDataPacket } from 'mysql2'

import { redis, sql } from '$lib/server/db'
import { verifyPw } from '$lib/server/password'
import { removeUpload } from '$lib/server/uploads'
import { validateEmail } from '$lib/api/helper'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	const { email, password } = await request.json()

	const previousSID = cookie.parse(request.headers.get('cookie') || '').sessionId

	if (!validateEmail(email).success) {
		return new Response(
			JSON.stringify({
				message: 'Invalid email'
			}),
			{
				status: 400
			}
		)
	}

	const [userRows] = await sql.query<({ id: number; avatar: string | null; password_hash: string } & RowDataPacket)[]>('SELECT id, avatar, password_hash FROM users WHERE email = ?', [email])
	const user = userRows[0]

	if (!user || !(await verifyPw(password, user.password_hash))) {
		return new Response(
			JSON.stringify({
				message: 'Invalid email or password'
			}),
			{
				status: 400
			}
		)
	}

	// their recipes + reviews go with it (on delete cascade)
	await sql.query('DELETE FROM users WHERE id = ?', [user.id])
	if (previousSID) await redis.del(previousSID)
	await removeUpload(user.avatar)

	return new Response(
		JSON.stringify({
			message: 'Finished deleting user'
		}),
		{
			status: 200,
			headers: {
				'Set-Cookie': cookie.serialize('sessionId', previousSID ?? '', {
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
