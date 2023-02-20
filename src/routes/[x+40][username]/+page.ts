import type { User } from '$lib/types'
import { error, redirect } from '@sveltejs/kit'
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, url }) => {
    const { username } = params

    const res = await fetch(`${url.origin}/api/user?username=${username}`, { method: 'GET' })

    const user: User = await res.json()

    if (user) {
        return {
            pageUser: user
        }
    } else {
        throw error(404, 'User not found.')
    }
}
