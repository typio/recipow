import * as cookie from 'cookie'
import stringHash from 'string-hash'
import jimp from 'jimp'
import { Upload } from '@aws-sdk/lib-storage'

import { redis, mongoClient, s3Client } from '$lib/db'
import { validateEmail, validateUsername, validateName } from './helper'

import type { RequestHandler } from '../../../.svelte-kit/types/src/routes/auth/__types/update'

export const post: RequestHandler = async ({ request }) => {
	try {
		const body = await request.formData()

		const newName = body.get('newName') as string
		const newUsername = body.get('newUsername') as string

		const email = JSON.parse(
			(await redis.get(cookie.parse(request.headers.get('cookie') || '').sessionId)) || '{}'
		).email

		const oldUsername = (await mongoClient
			.db('recipow')
			.collection('users')
			.find({ email })
			.toArray())[0].username

		const newAvatarFile = body.get('newAvatarFile')

		let validName = validateName(newName)
		if (!validName.success) {
			return {
				status: 400,
				body: {
					message: validName.msg
				}
			}
		}

		if (newUsername !== oldUsername) {
			let validUsername = await validateUsername(newUsername)
			if (!validUsername.success) {
				return {
					status: 400,
					body: {
						message: validUsername.msg
					}
				}
			}
		}

		if (newAvatarFile !== null) {
			// not sure how fix FormDataEntryValue type error
			const image = await jimp.read((await (newAvatarFile as File).arrayBuffer()) as Buffer)

			image.cover(128, 128, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_TOP)

			const newAvatarBuffer = await image.getBufferAsync(jimp.MIME_PNG)

			const emailHash = stringHash(email)

			const randomPart = '-' + Math.floor(Math.random() * 1000000)

			const s3Upload = new Upload({
				client: s3Client,
				params: {
					Bucket: 'recipow',
					Key: 'avatars/' + emailHash + randomPart + '.png',
					Body: newAvatarBuffer
				}
			})

			// uploadData.on("httpUploadProgress", (progress) => {
			//     console.log(progress);
			//   });

			const s3Result = await s3Upload.done()

			const newAvatarURL =
				'https://recipow.s3.us-west-1.amazonaws.com/avatars/' + emailHash + randomPart + '.png'

			const mongoResult = await mongoClient
				.db('recipow')
				.collection('users')
				.updateOne({ email }, { $set: { name: newName, username: newUsername, avatar: newAvatarURL } })

			if (mongoResult.matchedCount == 1 && s3Result.$metadata.httpStatusCode == 200) {
				return {
					status: 200,
					body: {
						message: 'Success'
					}
				}
			}

			return {
				status: 500,
				body: {
					message: 'Failed'
				}
			}
		}

		const res = await mongoClient
			.db('recipow')
			.collection('users')
			.updateOne({ email }, { $set: { name: newName, username: newUsername } })

		if (res.matchedCount == 1) {
			return {
				status: 200,
				body: {
					message: 'Matched with user'
				}
			}
		}

		return {
			status: 500,
			body: {
				message: "Couldn't find user"
			}
		}
	} catch (error) {
		return {
			status: 500,
			body: {
				message: 'Failed to upload, error: ' + error
			}
		}
	}
}
