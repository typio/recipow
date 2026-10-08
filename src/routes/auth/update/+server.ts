import jimp from 'jimp'

import { dupKey, sql } from '$lib/server/db'
import { sessionUser } from '$lib/server/session'
import { removeUpload, saveUpload } from '$lib/server/uploads'
import { validateUsername, validateName } from '$lib/api/helper'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ request }) => {
	try {
		const user = await sessionUser(request)
		if (!user) {
			return new Response(
				JSON.stringify({
					message: 'You need to be logged in.'
				}),
				{
					status: 401
				}
			)
		}

		const body = await request.formData()

		const newName = (body.get('newName') as string).replace(/</g, '&lt;').replace(/>/g, '&gt;')
		const newUsername = body.get('newUsername') as string
		const newAvatarFile = body.get('newAvatarFile')

		let validName = validateName(newName)
		if (!validName.success) {
			return new Response(
				JSON.stringify({
					message: validName.msg
				}),
				{
					status: 400
				}
			)
		}

		// usernames are case-insensitive in sql, recasing your own would otherwise collide with yourself
		if (newUsername.toLowerCase() !== user.username.toLowerCase()) {
			let validUsername = await validateUsername(newUsername)
			if (!validUsername.success) {
				return new Response(
					JSON.stringify({
						message: validUsername.msg
					}),
					{
						status: 400
					}
				)
			}
		}

		let avatar = user.avatar
		if (newAvatarFile && typeof newAvatarFile !== 'string') {
			const image = await jimp.read(Buffer.from(await newAvatarFile.arrayBuffer()))
			image.cover(128, 128, jimp.HORIZONTAL_ALIGN_CENTER | jimp.VERTICAL_ALIGN_TOP)
			avatar = await saveUpload('avatars', await image.getBufferAsync(jimp.MIME_PNG))
		}

		try {
			await sql.query('UPDATE users SET name = ?, username = ?, avatar = ? WHERE id = ?', [newName, newUsername, avatar, user.id])
		} catch (err) {
			// someone took the name between the check above and now
			if (dupKey(err) === 'username') {
				await removeUpload(avatar === user.avatar ? null : avatar)
				return new Response(
					JSON.stringify({
						message: 'Username is being used by someone else.'
					}),
					{
						status: 400
					}
				)
			}
			throw err
		}

		// old file only once the row points at the new one
		if (avatar !== user.avatar) await removeUpload(user.avatar)

		return new Response(
			JSON.stringify({
				message: 'Success'
			}),
			{
				status: 200
			}
		)
	} catch (error) {
		return new Response(
			JSON.stringify({
				message: 'Failed to upload, error: ' + error
			}),
			{
				status: 500
			}
		)
	}
}
