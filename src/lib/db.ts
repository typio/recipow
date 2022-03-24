import Redis from "ioredis"

const db = new Redis(6379)

export default db
