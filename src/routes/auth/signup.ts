import * as cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid'
import stringHash from 'string-hash'

import { redis, mongoClient } from '$lib/db'
import { validateEmail, validatePassword, validateName, TOKEN_EXPIRE_TIME } from './helper'

import type { AuthUser } from '$lib/types'
import type { RequestHandler } from '.svelte-kit/types/src/routes/auth/__types/signup'

export const post: RequestHandler = async ({ request, clientAddress }) => {
	const { email, name, password } = await request.json()

	let validEmail = validateEmail(email)
	if (!validEmail.success) {
		return {
			status: 400,
			body: {
				message: validEmail.msg
			}
		}
	}

	let validPassword = validatePassword(password)
	if (!validPassword.success) {
		return {
			status: 400,
			body: {
				message: validPassword.msg
			}
		}
	}

	let validName = validateName(name)
	if (!validName.success) {
		return {
			status: 400,
			body: {
				message: validName.msg
			}
		}
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

	if (user.email) {
		return {
			status: 400,
			body: {
				message: 'User with this email already exists'
			}
		}
	}

	let username = email.split('@')[0]

	if (
		(await mongoClient.db('recipow').collection('users').find({ username }).toArray()).length > 0
	) {
		username += Math.floor(Math.random() * 1000)
	}

	// dont want while in case this can be exploited somehow
	if (
		(await mongoClient.db('recipow').collection('users').find({ username }).toArray()).length > 0
	) {
		return {
			status: 400,
			body: {
				message: "Couldn't generate unique username, please try again."
			}
		}
	}

	// add user in redis
	await redis.set(
		email,
		JSON.stringify({
			email,
			passwordHash: hash
		})
	)

	// add cookie in redis
	await redis.set(
		cookieId,
		JSON.stringify({
			email
		}),
		'EX',
		TOKEN_EXPIRE_TIME
	)

	// add user in mongo
	let newMongoUser = {
		ip: clientAddress,
		email,
		name,
		username,
		avatar: 'https://www.fillmurray.com/' + (Math.floor(32 + Math.random() * 96) + '/').repeat(2)
	}
	await mongoClient.db('recipow').collection('users').insertOne(newMongoUser)

	// set cookie
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
			message: 'User created successfully'
		}
	}
}
