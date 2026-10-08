import { error } from '@sveltejs/kit'

import { readUpload } from '$lib/server/uploads'
import type { RequestHandler } from './$types'

// dev only in practice, nginx answers /uploads/ before it reaches the app
export const GET: RequestHandler = async ({ params }) => {
	const png = await readUpload(`/uploads/${params.kind}/${params.name}`)
	if (!png) throw error(404, 'Not found')
	return new Response(png, { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=31536000, immutable' } })
}
