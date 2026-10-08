import jimp from 'jimp'

import { sessionUser } from '$lib/server/session'
import { saveUpload } from '$lib/server/uploads'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	// local disk now, anonymous uploads would just fill it
	if (!(await sessionUser(request))) {
		return new Response(
			JSON.stringify({
				message: 'You need to be logged in to upload images.'
			}),
			{
				status: 401
			}
		)
	}

	// bucketName + isTemp were s3 only, the folder is fixed so it can't be steered
	const { imageBase64 } = await request.json()

	const image = await jimp.read(Buffer.from(imageBase64.split(',')[1], 'base64'))

	if (image.getWidth() > 1000) {
		image.contain(1000, jimp.AUTO, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
	}

	if (image.getHeight() > 800) {
		image.contain(jimp.AUTO, 800, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_MIDDLE)
	}

	const imageUrl = await saveUpload('recipe_imgs', await image.getBufferAsync(jimp.MIME_PNG))

	return new Response(JSON.stringify({ imageUrl }), { status: 200 })
}
