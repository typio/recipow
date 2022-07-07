import * as cookie from 'cookie'
import stringHash from 'string-hash'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import { redis, mongoClient, s3Client } from '$lib/db'
import { validateEmail, validatePassword, TOKEN_EXPIRE_TIME } from './helper'


/** @type {import('../auth/__types/delete').RequestHandler} */
export const post = async ({ request }) => {
	const { email, password } = await request.json()

	const previousSID = cookie.parse(request.headers.get('cookie') || '').sessionId

	const hash = stringHash(password)

	if (!validateEmail(email)) {
		return {
			status: 400,
			body: {
				message: 'Invalid email'
			}
		}
	}

	if (!validatePassword(password)) {
		return {
			status: 400,
			body: {
				message: 'Invalid password'
			}
		}
	}

	if (JSON.parse(await redis.get(email) || '{}').passwordHash == hash) {
		await redis.del(previousSID)

		try {
			const result = await redis.del(email)
			console.log("Redis result: ", result)
		} catch (err) {
			console.log("Failed to delete user from redis, error: ", err)
		}

		try {
			const result = await mongoClient.db("recipow").collection('users').deleteOne(
				{ "id": email })
			console.log("MongoDB result: ", result)
		} catch (err) {
			console.log("Failed to delete user from MongoDB, error: ", err)
		}

		try {
			const result = await s3Client.send(new DeleteObjectCommand(
				{
					Bucket: "recipow",
					Key: "avatars/" + stringHash(email) + '.png'
				}
			))//.then((res) => { return res })
			console.log("S3 result: ", result)
		} catch (err) {
			console.log("Failed to delete avatar from S3, error: ", err)
		}

		return {
			status: 200,
			body: {
				message: 'Finished deleting user',
			},
			headers: {
				'Set-Cookie': cookie.serialize(
					'sessionId',
					previousSID,
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

	return {
		status: 400,
		body: {
			message: 'Invalid email or password',
		}
	}
}