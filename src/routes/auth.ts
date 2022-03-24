import * as cookie from 'cookie'
import { v4 as uuidv4 } from 'uuid'
import stringHash from 'string-hash'
// import type { RequestHandler } from '@sveltejs/kit'

import db from "$lib/db"

interface IBody {
    type: string,
    email: string,
    password: string,
}

export const get = async () => {
    return {
        body: {
            message: 'Hello from auth'
        }
    }
}

export const post = async ({ request }: { request: Request }) => {
    const body = await request.json()

    db.get(body.email).then(function (result) { return result })

    const user = JSON.parse((await db.get(body.email)) || '{}')
    // check if user already exists
    if (user) {
        return {
            status: 409,
            body: {
                error: 'A user with that email already exists.'
            }
        }
    }

    // return {
    // 	status: 200,
    // 	body: {
    // 		message: 'Success'
    // 	}
    // }

    // add user entry to db
    await db.set(
        body.email,
        JSON.stringify({
            email: body.email,
            password: stringHash(body.password)
        })
    )

    // create unique cookie and save to db to an associated email
    const cookieId = uuidv4()
    await db.set(cookieId, JSON.stringify({ email: body.email }))

    const headers = {
        'Set-Cookie': cookie.serialize('session_id', cookieId, {
            httpOnly: true,
            maxAge: 60 * 60 * 24,
            sameSite: 'strict',
            path: '/'
        })
    }

    return {
        status: 200,
        headers,
        body: {
            message: 'Success'
        }
    }
}
