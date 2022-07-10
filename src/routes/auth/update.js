import * as cookie from 'cookie'
import stringHash from 'string-hash'
import jimp from 'jimp'
import { Upload } from "@aws-sdk/lib-storage"

import { redis, mongoClient, s3Client } from '$lib/db'

/** @type {import('../auth/__types/update').RequestHandler} */
export const post = async ({ request }) => {
    try {
        const body = await request.formData()

        const newName = body.get('newName')

        const email = JSON.parse(await redis.get(cookie.parse(request.headers.get('cookie') || '').sessionId) || '{}').email

        const newAvatarFile = body.get('newAvatarFile')

        if (newAvatarFile !== null) {
            // not sure how fix FormDataEntryValue type error
            const image = await jimp.read(await newAvatarFile.arrayBuffer())

            image.cover(
                128,
                128,
                jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_TOP
            )

            const newAvatarBuffer = await image.getBufferAsync(jimp.MIME_PNG)

            const emailHash = stringHash(email)

            const randomPart = '-' + Math.floor(Math.random() * 1000000)

            const s3Upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: "recipow",
                    Key: "avatars/" + emailHash + randomPart + '.png',
                    Body: newAvatarBuffer,
                },
            })

            // uploadData.on("httpUploadProgress", (progress) => {
            //     console.log(progress);
            //   });

            const s3Result = await s3Upload.done()

            const newAvatarURL = 'https://recipow.s3.us-west-1.amazonaws.com/avatars/' + emailHash + randomPart + '.png'

            const mongoResult = await mongoClient.db('recipow').collection('users').updateOne(
                { "id": email },
                { $set: { "name": newName, "avatar": newAvatarURL } }
            )

            if (mongoResult.matchedCount == 1 &&
                s3Result.$metadata.httpStatusCode == 200) {
                return {
                    status: 200,
                    body: {
                        message: "Success"
                    }
                }
            }

            return {
                status: 500,
                body: {
                    message: 'Failed'
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
            status: 500,
            body: {
                message: 'Couldn\'t find user'
            }
        }
    } catch (error) {
        return {
            status: 500,
            body: {
                message: 'Failed to upload, error: ' + error
            }
        }
    }
}


