import { session } from '$app/stores'
import db from '$lib/db'

/** @type {import('./__types/user').RequestHandler} */
export const get = async ({ request }) => {
	return {
		body: {
			user: {
				id: '123',
				name: 'John Doe',
				email: ' ',
				avatar: 'https://placekitten.com/200/200'
			}
		},
		status: 200
	}
}
