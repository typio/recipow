import * as cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid'

import { redis, sql } from '$lib/server/db'
import { validateEmail, TOKEN_EXPIRE_TIME } from '$lib/api/helper'

import type { RequestHandler } from './$types'
import type { RowDataPacket } from 'mysql2'
import { hashPassword, isLegacy, verifyPw } from '$lib/server/password'

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const clientAddress = getClientAddress()
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

	const [userRows] = await sql.query<({ id: number; password_hash: string } & RowDataPacket)[]>('SELECT id, password_hash FROM users WHERE email = ?', [email])
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

	// right password for a legacy account, upgrade it while we have the plaintext
	const passwordHash = isLegacy(user.password_hash) ? await hashPassword(password) : user.password_hash
	await sql.query('UPDATE users SET password_hash = ?, ip = ? WHERE id = ?', [passwordHash, clientAddress, user.id])

	const cookieId = uuidv4()

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
		return new Response(
			JSON.stringify({
				message: 'User validated successfully (already logged in)'
			}),
			{
				status: 200,
				headers: {
					'Set-Cookie': cookie.serialize('sessionId', previousSID, {
						path: '/',
						httpOnly: true,
						maxAge: TOKEN_EXPIRE_TIME,
						sameSite: 'strict',
						secure: true
					})
				}
			}
		)
	}

	await redis.set(
		cookieId,
		JSON.stringify({
			email
		}),
		'EX',
		TOKEN_EXPIRE_TIME
	)

	return new Response(
		JSON.stringify({
			message: 'User validated successfully'
		}),
		{
			status: 200,
			headers: {
				'Set-Cookie': cookie.serialize('sessionId', cookieId, {
					path: '/',
					httpOnly: true,
					maxAge: TOKEN_EXPIRE_TIME,
					sameSite: 'strict',
					secure: true
				})
			}
		}
	)
}
