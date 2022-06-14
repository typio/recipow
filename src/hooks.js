import cookie from 'cookie'

// /** @type {import('@sveltejs/kit').Handle} */
// export const handle = async ({ event, resolve }) => {
// 	const response = await resolve(event, {
// 		ssr: true
// 	})

// 	return response
// }

/** @type {import('@sveltejs/kit').GetSession} */
export const getSession = async ({ request }) => {
	const { sessionId } = cookie.parse(request.headers.get('cookie') || '')


	return { sessionId }
}
