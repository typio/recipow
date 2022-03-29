import * as cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid'
import stringHash from 'string-hash'

import redis from '$lib/db'

const TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 90 // 90 days

export const get = async () => {
	return {
		body: {
			message: 'Hello from auth'
		}
	}
}

export const post = async ({ request }: any) => {
	const { email, password, type } = await request.json()

	if (type != 'login' && type != 'signup' && type != 'logout') {
		return {
			status: 400,
			body: {
				message: 'Missing type'
			}
		}
	}

	if (type == 'logout') {
		await redis.del(cookie.parse(request.headers.get('cookie') || '').userid)
		return {
			status: 200,
			body: {
				message: 'User logged out successfully'
			},
			headers: {
				'Set-Cookie': cookie.serialize(
					'userid',
					cookie.parse(request.headers.get('cookie') || '').userid,
					{
						path: '/',
						httpOnly: true,
						maxAge: -1
					}
				)
			}
		}
	}

	if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
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

	const user: any = await (async () => {
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

		await redis.set(
			email,
			JSON.stringify({
				email,
				password: hash
			})
		)

		await redis.set(
			cookieId,
			JSON.stringify({
				email
			}),
			'ex',
			TOKEN_EXPIRE_TIME
		)

		return {
			status: 200,
			headers: {
				'Set-Cookie': cookie.serialize('userid', cookieId, {
					path: '/',
					httpOnly: true,
					maxAge: TOKEN_EXPIRE_TIME
				})
			},
			body: {
				message: 'User created successfully'
			}
		}
	}

	if (type == 'login') {
		// no need to check email i think, bc user will be {} if email not in redis
		if (user.password != hash) {
			return {
				status: 400,
				body: {
					message: 'Invalid email or password'
				}
			}
		}

		// if user already logged in dont create new cookie
		if (await redis.get(cookie.parse(request.headers.get('cookie') || '').userid)) {
			// refresh expire time on redis and local cookie
			await redis.set(
				cookie.parse(request.headers.get('cookie') || '').userid,
				JSON.stringify({
					email
				}),
				'ex',
				TOKEN_EXPIRE_TIME
			)
			return {
				status: 200,
				body: {
					message: 'User validated successfully (already logged in)'
				},
				headers: {
					'Set-Cookie': cookie.serialize(
						'userid',
						cookie.parse(request.headers.get('cookie') || '').userid,
						{
							path: '/',
							httpOnly: true,
							maxAge: TOKEN_EXPIRE_TIME
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
			'ex',
			TOKEN_EXPIRE_TIME
		)

		return {
			status: 200,
			headers: {
				'Set-Cookie': cookie.serialize('userid', cookieId, {
					path: '/',
					httpOnly: true,
					maxAge: TOKEN_EXPIRE_TIME
				})
			},
			body: {
				message: 'User validated successfully'
			}
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
