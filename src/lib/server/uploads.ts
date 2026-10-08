import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { v4 as uuidv4 } from 'uuid'

import { env } from '$env/dynamic/private'

// nginx serves /uploads/ in prod, routes/uploads in dev. relative to cwd = /var/www/recipow on the server
const dir = () => env.UPLOAD_DIR || 'uploads'

const KINDS = ['avatars', 'recipe_imgs'] as const
type UploadKind = (typeof KINDS)[number]
const NAME = /^[0-9a-f-]{36}\.png$/

export const saveUpload = async (kind: UploadKind, png: Buffer) => {
	const name = `${uuidv4()}.png`
	await mkdir(join(dir(), kind), { recursive: true })
	await writeFile(join(dir(), kind, name), png)
	return `/uploads/${kind}/${name}`
}

// disk path for urls this module made, null for anything else (no avatar, old s3 links, ../)
const pathOf = (url: string | null) => {
	if (!url) return null
	const [, root, kind, name] = url.split('/')
	return root === 'uploads' && KINDS.includes(kind as UploadKind) && NAME.test(name ?? '') ? join(dir(), kind, name) : null
}

export const readUpload = async (url: string | null) => {
	const path = pathOf(url)
	return path ? readFile(path).catch(() => null) : null
}

export const removeUpload = async (url: string | null) => {
	const path = pathOf(url)
	if (path) await unlink(path).catch(() => {})
}
