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
	// for some reason cookie.parse does not work in production???
	// const { sessionId } = cookie.parse(request.headers.get('cookie') || '')
	const { sessionId } = {
		sessionId: (request.headers.get('cookie') || '').split('=')[1]
	}

	return { sessionId }
}
