import jimp from 'jimp'
import { v4 as uuidv4 } from 'uuid'
import { Upload } from '@aws-sdk/lib-storage'

import { redis, mongoClient, s3Client } from '$lib/db'
import { Tag } from '@aws-sdk/client-s3'

import type { RequestHandler } from '.svelte-kit/types/src/routes/api/__types/uploadImage'

export const post: RequestHandler = async ({ request }) => {
	const { bucketName, imageBase64, isTemp } = await request.json()

	const randomPart = uuidv4()

	const Key = bucketName + '/' + randomPart + '.png'

	const image = await jimp.read(Buffer.from(imageBase64.split(',')[1], 'base64'))

	image.contain(
		Math.min(image.getWidth(), 800),
		Math.min(image.getHeight(), 1000),
		jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE
	)

	const newImageBuffer = await image.getBufferAsync(jimp.MIME_PNG)

	const s3Upload = new Upload({
		client: s3Client,
		params: {
			Bucket: 'recipow',
			Key,
			Body: newImageBuffer
		},
		tags: [{ Key: 'isTemp', Value: isTemp }]
	})

	const s3Result = await s3Upload.done()

	console.log(s3Result)

	const newImageURL = 'https://recipow.s3.us-west-1.amazonaws.com/' + Key

	return {
		status: 200,
		body: {
			imageUrl: newImageURL
		}
	}
}
