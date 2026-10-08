import * as cookie from 'cookie'

import type { LayoutServerLoad } from './$types'
import { redis, sql } from '$lib/server/db'
import type { User } from '$lib/types'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'

export const load: LayoutServerLoad = async ({ request, getClientAddress }) => {
	const clientAddress = getClientAddress()
	const cookies = cookie.parse(request.headers.get('cookie') || '')

	const email = JSON.parse((await redis.get(cookies.sessionId)) || '{}').email

	// log IP address
	sql.query<ResultSetHeader>('INSERT INTO ips (ip) VALUES (?) ON DUPLICATE KEY UPDATE last_seen = CURRENT_TIMESTAMP(3)', [clientAddress]).catch(() => {})

	// return user if logged in
	if (email != undefined) {
		const [userRows, _] = await sql.query<(User & RowDataPacket)[]>('SELECT id, email, name, username, avatar FROM users WHERE email = ?', [email])

		return {
			user: userRows[0]
		}
	}

	return {
		user: null
	}
}
