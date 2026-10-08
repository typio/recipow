import mysql from 'mysql2/promise'
import Redis from 'ioredis'
import { env } from '$env/dynamic/private'

export const sql = mysql.createPool({ uri: env.DATABASE_URL || 'mysql://recipow:devpass@localhost:3306/recipow', connectionLimit: 10, timezone: 'Z', decimalNumbers: true })

sql.on('connection', c => c.query("SET time_zone = '+00:00'"))

export const redis = new Redis(env.REDIS_URL || 'redis://127.0.0.1:6379', {
	keyPrefix: 'recipow:'
})

export const json = <T>(v: unknown): T => (typeof v === 'string' ? JSON.parse(v) : v) as T

// Close the connection pool on shutdown so Bun's event loop can exit cleanly.
// Without this, systemd waits 5s and SIGKILLs the process on every restart.
const closePool = async () => {
	if (sql) {
		await sql.end().catch(() => {})
	}
}
process.on('SIGTERM', closePool)
process.on('SIGINT', closePool)

// unique key that rejected the write, or null if it wasn't a duplicate
export const dupKey = (e: any): string | null => (e?.code === 'ER_DUP_ENTRY' ? e.sqlMessage?.match(/for key '(?:\w+\.)?(\w+)'/)?.[1] ?? null : null)
