import * as cookie from 'cookie'
import stringHash from 'string-hash'
import jimp from 'jimp'
import { Upload } from '@aws-sdk/lib-storage'

import { redis, mongoClient, s3Client } from '$lib/db'
import { validateUsername, validateName } from '$lib/api/helper'

import type { RequestHandler } from './$types'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.formData()

		const newName = (body.get('newName') as string).replace(/</g, "&lt;").replace(/>/g, "&gt;");
		const newUsername = body.get('newUsername') as string

		const email = JSON.parse((await redis.get(cookie.parse(request.headers.get('cookie') || '').sessionId)) || '{}').email

		const oldUsername = (await mongoClient.db('recipow').collection('users').find({ email }).toArray())[0].username

		const newAvatarFile = body.get('newAvatarFile')

		let validName = validateName(newName)
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

		if (newUsername !== oldUsername) {
			let validUsername = await validateUsername(newUsername)
			if (!validUsername.success) {
				return new Response(
					JSON.stringify({
						message: validUsername.msg
					}),
					{
						status: 400
					}
				)
			}
		}

		if (newAvatarFile !== null) {
			// not sure how fix FormDataEntryValue type error
			const image = await jimp.read((await (newAvatarFile as File).arrayBuffer()) as Buffer)

			image.cover(128, 128, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_TOP)

			const newAvatarBuffer = await image.getBufferAsync(jimp.MIME_PNG)

			const emailHash = stringHash(email)

			const randomPart = '-' + Math.floor(Math.random() * 1000000)

			// remove old avatar
			const avatarURL = (await mongoClient.db('recipow').collection('users').findOne({ email }))?.avatar.split('.com/')[1]

			if (avatarURL.startsWith('avatars/')) {
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
			}

			// upload new avatar
			const s3Upload = new Upload({
				client: s3Client,
				params: {
					Bucket: 'recipow',
					Key: 'avatars/' + emailHash + randomPart + '.png',
					Body: newAvatarBuffer
				}
			})

			const s3Result = await s3Upload.done()

			const newAvatarURL = 'https://recipow.s3.us-west-1.amazonaws.com/avatars/' + emailHash + randomPart + '.png'

			const mongoResult = await mongoClient
				.db('recipow')
				.collection('users')
				.updateOne({ email }, { $set: { name: newName, username: newUsername, avatar: newAvatarURL } })

			if (mongoResult.matchedCount == 1 && s3Result.$metadata.httpStatusCode == 200) {
				return new Response(
					JSON.stringify({
						message: 'Success'
					}),
					{
						status: 200
					}
				)
			}

			return new Response(
				JSON.stringify({
					message: 'Failed'
				}),
				{
					status: 500
				}
			)
		}

		const res = await mongoClient
			.db('recipow')
			.collection('users')
			.updateOne({ email }, { $set: { name: newName, username: newUsername } })

		if (res.matchedCount == 1) {
			return new Response(
				JSON.stringify({
					message: 'Matched with user'
				}),
				{
					status: 200
				}
			)
		}
		return new Response(
			JSON.stringify({
				message: "Couldn't find user"
			}),
			{
				status: 500
			}
		)
	} catch (error) {
		return new Response(
			JSON.stringify({
				message: 'Failed to upload, error: ' + error
			}),
			{
				status: 500
			}
		)
	}
}
