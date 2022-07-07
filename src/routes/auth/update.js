import * as cookie from 'cookie'
import stringHash from 'string-hash'
import sharp from "sharp"
import { Upload } from "@aws-sdk/lib-storage"

import { redis, mongoClient, s3Client } from '$lib/db'

/** @type {import('../auth/__types/update').RequestHandler} */
export const post = async ({ request }) => {

    const body = await request.formData()
    const newName = body.get('newName')

    const email = JSON.parse(await redis.get(cookie.parse(request.headers.get('cookie') || '').sessionId) || '{}').email

    const emailHash = stringHash(email)

    const newAvatarFile = body.get('newAvatarFile')

    if (newAvatarFile) {
        const newAvatarBuffer =
            await sharp(
                Buffer.from(
                    (await newAvatarFile.arrayBuffer()), 'binary'))
                .resize(128, 128, {
                    fit: 'cover',
                    position: 'top'
                })
                .png()
                .toBuffer()
                .then(data => {
                    return data
                })

        const bucketParams = {
            Bucket: "recipow",
            Key: "avatars/" + emailHash + '.png',
            Body: newAvatarBuffer,
        }

        try {
            const data = new Upload({
                client: s3Client,
                params: bucketParams,
            })

            await data.done()
        } catch (err) {
            return {
                status: 500,
                body: {
                    message: 'Failed to upload, error: ' + err
                }
            }
        }

        const newAvatarURL = 'https://recipow.s3.us-west-1.amazonaws.com/avatars/' + emailHash + '.png'

        const res = await mongoClient.db('recipow').collection('users').updateOne(
            { "id": email },
            { $set: { "name": newName, "avatar": newAvatarURL } }
        )

        if (res.matchedCount == 1) {
            return {
                status: 200,
                body: {
                    message: "Matched with user"
                }
            }
        }

        return {
            status: 400,
            body: {
                message: 'Couldn\'t find user'
            }
        }
    }

    const res = await mongoClient.db('recipow').collection('users').updateOne(
        { "id": email },
        { $set: { "name": newName } }
    )

    if (res.matchedCount == 1) {
        return {
            status: 200,
            body: {
                message: "Matched with user"
            }
        }
    }

    return {
        status: 400,
        body: {
            message: 'Couldn\'t find user'
        }
    }
}