import * as cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid'

import { dupKey, redis, sql } from '$lib/server/db'
import { validateEmail, validatePassword, validateName, TOKEN_EXPIRE_TIME } from '$lib/api/helper'

import type { User } from '$lib/types'
import type { RequestHandler } from './$types'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { hashPassword } from '$lib/server/password'

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const clientAddress = getClientAddress()
	const { email, name, password } = await request.json()

	let validEmail = validateEmail(email)
	if (!validEmail.success) {
		return new Response(
			JSON.stringify({
				message: validEmail.msg
			}),
			{
				status: 400
			}
		)
	}

	let validPassword = validatePassword(password)
	if (!validPassword.success) {
		return new Response(
			JSON.stringify({
				message: validPassword.msg
			}),
			{
				status: 400
			}
		)
	}

	let validName = validateName(name)
	if (!validName.success) {
		return new Response(
			JSON.stringify({
				message: validName.msg
			}),
			{
				status: 400
			}
		)
	}

	const cookieId = uuidv4()

	const [userRows, _] = await sql.query<(User & RowDataPacket)[]>('SELECT 1 FROM users WHERE email = ?', [email])
	if (userRows.length > 0) {
		return new Response(
			JSON.stringify({
				message: 'User with this email already exists'
			}),
			{
				status: 400
			}
		)
	}

	let username = email.split('@')[0].slice(0, 27)

	if ((await sql.query<(User & RowDataPacket)[]>('SELECT 1 FROM users WHERE username = ?', [username]))[0].length) {
		username += Math.floor(Math.random() * 1000)
	}

	try {
		// add user
		await sql.query<ResultSetHeader>('INSERT INTO users (email, username, name, password_hash, ip) VALUES (?, ?, ?, ?, ?)', [email, username, name, await hashPassword(password), clientAddress])
	} catch (err) {
		const key = dupKey(err)
		if (key === 'email') return new Response(JSON.stringify({ message: 'Email already in use.' }), { status: 400 })
		if (key === 'username') return new Response(JSON.stringify({ message: "Couldn't generate a new username, try again." }), { status: 400 })
		throw err
	}

	// add cookie in redis
	await redis.set(
		cookieId,
		JSON.stringify({
			email
		}),
		'EX',
		TOKEN_EXPIRE_TIME
	)

	// set cookie
	return new Response(
		JSON.stringify({
			message: 'User created successfully'
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
