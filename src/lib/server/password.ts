import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import stringHash from 'string-hash'

const kdf = (pw: string, salt: Buffer) => new Promise<Buffer>((res, rej) => scrypt(pw, salt, 64, (e, k) => (e ? rej(e) : res(k))))

export const hashPassword = async (pw: string) => {
	const salt = randomBytes(64)
	return `scrypt$${salt.toString('base64')}$${(await kdf(pw, salt)).toString('base64')}`
}

export const isLegacy = (stored: string) => stored.startsWith('stringhash$')

export const verifyPw = async (pw: unknown, stored: string) => {
	if (typeof pw !== 'string') return false
	if (isLegacy(stored)) return stringHash(pw) === Number(stored.slice('stringhash$'.length))

	const [kind, salt, hash] = stored.split('$')
	if (kind !== 'scrypt' || !salt || !hash) return false

	const expected = Buffer.from(hash, 'base64')
	const actual = await kdf(pw, Buffer.from(salt, 'base64'))
	// timingSafeEqual throws on a length mismatch
	return actual.length === expected.length && timingSafeEqual(actual, expected)
}
