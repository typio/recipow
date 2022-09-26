import * as cookie from 'cookie'
import stringHash from 'string-hash'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import { redis, mongoClient, s3Client } from '$lib/db'
import { validateEmail, validatePassword } from '$lib/api/helper'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	const { email, password } = await request.json()

	const previousSID = cookie.parse(request.headers.get('cookie') || '').sessionId

	const hash = stringHash(password)

	if (!validateEmail(email)) {
		return new Response(
			JSON.stringify({
				message: 'Invalid email'
			}),
			{
				status: 400
			}
		)
	}

	if (!validatePassword(password)) {
		return new Response(
			JSON.stringify({
				message: 'Invalid password'
			}),
			{
				status: 400
			}
		)
	}

	if (JSON.parse((await redis.get(email)) || '{}').passwordHash == hash) {
		await redis.del(previousSID)

		// delete avatar
		const avatarURL = (await mongoClient.db('recipow').collection('users').findOne({ email }))?.avatar.split('.com/')[1]

		try {
			const result = await s3Client.send(
				new DeleteObjectCommand({
					Bucket: 'recipow',
					Key: avatarURL
				})
			)
			console.log('S3 result: ', result)
		} catch (err) {
			console.log('Failed to delete avatar from S3, error: ', err)
		}

		// delete redis user
		try {
			const result = await redis.del(email)
			console.log('Redis result: ', result)
		} catch (err) {
			console.log('Failed to delete user from redis, error: ', err)
		}

		// delete mongo user
		try {
			const result = await mongoClient.db('recipow').collection('users').deleteOne({ email })
			console.log('MongoDB result: ', result)
		} catch (err) {
			console.log('Failed to delete user from MongoDB, error: ', err)
		}

		return new Response(
			JSON.stringify({
				message: 'Finished deleting user'
			}),
			{
				status: 200,
				headers: {
					'Set-Cookie': cookie.serialize('sessionId', previousSID, {
						path: '/',
						httpOnly: true,
						maxAge: -1,
						sameSite: 'strict',
						secure: true
					})
				}
			}
		)
	}
	return new Response(
		JSON.stringify({
			message: 'Invalid email or password'
		}),
		{
			status: 400
		}
	)
}
