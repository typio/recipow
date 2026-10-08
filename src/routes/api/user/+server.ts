import { sql } from '$lib/server/db'
import type { User } from '$lib/types'
import type { RowDataPacket } from 'mysql2'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url: { searchParams } }: { url: URL }) => {
	const username = searchParams.get('username') || ''

	const [userRows, _] = await sql.query<(User & RowDataPacket)[]>('SELECT name, username, avatar FROM users WHERE username = ?', [username])
	const user = userRows[0]

	if (user) {
		return new Response(JSON.stringify(user), { status: 200 })
	} else {
		return new Response(JSON.stringify(null), { status: 404 })
	}
}
