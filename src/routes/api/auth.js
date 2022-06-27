import * as cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid'
import stringHash from 'string-hash'

import { redis } from '$lib/db'

const TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 1 // 1 days

/** @type {import('../api/__types/auth').RequestHandler} */
export const get = async ({ request }) => {
	const { sessionId } = cookie.parse(request.headers.get('cookie') || '')
	return {
		body: JSON.parse((await redis.get(sessionId)) || '{}')
	}
}

/** @type {import('../api/__types/auth').RequestHandler} */
export const post = async ({ request }) => {
	const { email, password, type } = await request.json()

	const previousCookie = cookie.parse(request.headers.get('cookie') || '').sessionId

	if (type == 'logout') {
		await redis.del(previousCookie)
		return {
			status: 200,
			body: {
				message: 'User logged out successfully'
			},
			headers: {
				'Set-Cookie': cookie.serialize(
					'sessionId',
					previousCookie,
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

	if (typeof email !== 'string' ||
		!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
		return {
			status: 400,
			body: {
				message: 'Invalid email'
			}
		}
	}

	// require password with one lowercase, one uppercase, and one number
	if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
		return {
			status: 400,
			body: {
				message: 'Invalid password'
			}
		}
	}

	/** @type {import('$lib/types').authUser} */
	const user = await (async () => {
		try {
			return JSON.parse((await redis.get(email)) || '{}')
		} catch (error) {
			console.log('Failed to parse JSON of redis value, error:', error)
			return {}
		}
	})()
	const hash = stringHash(password)
	const cookieId = uuidv4()

	if (type == 'signup') {
		if (user.email) {
			return {
				status: 400,
				body: {
					message: 'User already exists'
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

		return {
			status: 200,
			headers: {
				'Set-Cookie': cookie.serialize(
					'sessionId',
					cookieId, {
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

	if (type == 'login') {
		// no need to check email i think, bc user will be {} if email not in redis
		if (user.passwordHash != hash) {
			return {
				status: 400,
				body: {
					message: 'Invalid email or password'
				}
			}
		}

		// if user already logged in dont create new cookie
		if (await redis.get(previousCookie)) {
			// refresh expire time on redis and local cookie
			await redis.set(
				previousCookie,
				JSON.stringify({
					email
				}),
				'EX',
				TOKEN_EXPIRE_TIME
			)
			return {
				status: 200,
				body: {
					message: 'User validated successfully (already logged in)'
				},
				headers: {
					'Set-Cookie': cookie.serialize(
						'sessionId',
						previousCookie,
						{
							path: '/',
							httpOnly: true,
							maxAge: TOKEN_EXPIRE_TIME,
							sameSite: 'strict',
							secure: true
						}
					)
				}
			}
		}

		await redis.set(
			cookieId,
			JSON.stringify({
				email
			}),
			'EX',
			TOKEN_EXPIRE_TIME
		)

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
				message: 'User validated successfully',
			}
		}
	}

	return {
		status: 400,
		body: {
			message: 'Missing type'
		}
	}

}

// export const delete_ = async ({ request }: any) => {
//     const { email } = await request.json()

//     if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
//         return {
//             status: 400,
//             body: {
//                 message: 'Invalid email'
//             }
//         }
//     }

//     const user = JSON.parse(await redis.get(email) || '{}')
//     if (!user.email) {
//         return {
//             status: 400,
//             body: {
//                 message: 'User does not exist'
//             }
//         }
//     }

//     await redis.del(email)

//     return {
//         status: 200,
//         body: {
//             message: 'User deleted successfully',
//         }
//     }
// }
