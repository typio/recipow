import * as cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid'
import stringHash from 'string-hash'

import { mongoClient, redis } from '$lib/db'
import { validateEmail, validatePassword, TOKEN_EXPIRE_TIME } from '$lib/api/helper'

import type { RequestHandler } from './$types'
import type { AuthUser } from '$lib/types'

export const POST: RequestHandler = async ({ request, clientAddress }) => {

	const { email, password } = await request.json()

	const previousSID = cookie.parse(request.headers.get('cookie') || '').sessionId


	if (!validateEmail(email)) {
		return new Response(
			JSON.stringify({
				message: 'Invalid email'
			}),
			{
				status: 400,
			}
		)
	}

	if (!validatePassword(password)) {
		return new Response(
			JSON.stringify({
				message: 'Invalid password'
			}),
			{
				status: 400,
			}
		)
	}

	const user: AuthUser = await (async () => {
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
		return new Response(
			JSON.stringify({
				message: 'Invalid email or password'
			}),
			{
				status: 400,
			}
		)
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
			},
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

	const mongoResult = await mongoClient
		.db('recipow')
		.collection('users')
		.updateOne(
			{ email },
			{ $set: { ip: clientAddress } }
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
			},
		}
	)
}
