import jimp from 'jimp'
import { v4 as uuidv4 } from 'uuid'
import { Upload } from '@aws-sdk/lib-storage'

import { s3Client } from '$lib/db'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	const { bucketName, imageBase64, isTemp } = await request.json()

	const randomPart = uuidv4()

	const Key = bucketName + '/' + randomPart + '.png'

	const image = await jimp.read(Buffer.from(imageBase64.split(',')[1], 'base64'))

	if (image.getWidth() > 1000) {
		image.contain(1000, jimp.AUTO, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
	}

	if (image.getHeight() > 800) {
		image.contain(jimp.AUTO, 800, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
	}

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

	return new Response(JSON.stringify({ imageUrl: newImageURL }), { status: 200 })
}
