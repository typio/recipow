import * as cookie from 'cookie'
import type { RowDataPacket } from 'mysql2'

import { redis, sql } from '$lib/server/db'

export type SessionUser = { id: number; email: string; username: string; avatar: string | null }

// signed in user from the sessionId cookie, null when logged out
export const sessionUser = async (request: Request): Promise<SessionUser | null> => {
	const sid = cookie.parse(request.headers.get('cookie') || '').sessionId
	if (!sid) return null
	const email = JSON.parse((await redis.get(sid)) || '{}').email
	if (!email) return null
	const [rows] = await sql.query<(SessionUser & RowDataPacket)[]>('SELECT id, email, username, avatar FROM users WHERE email = ?', [email])
	return rows[0] ?? null
}
