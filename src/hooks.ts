import cookie from 'cookie'

import redis from '$lib/db'

export const getSession = async ({ request }: any) => {
	const { userid } = cookie.parse(request.headers.get('cookie') || '')

	const { email }: any = await (async () => {
		try {
			return JSON.parse((await redis.get(userid)) || '{}')
		} catch (error) {
			console.log('Failed to parse JSON of redis value, error:', error)
			return {}
		}
	})()

	if (email) {
		return {
			auth: true,
			email: email
		}
	} else {
		return {
			auth: false
		}
	}

}
