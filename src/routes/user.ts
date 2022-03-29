import { session } from '$app/stores'
import db from '$lib/db'

export const get = async ({ request }: any) => {
    return {
        status: 200
    }
}