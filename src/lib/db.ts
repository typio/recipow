import Redis from "ioredis"
import * as dotenv from 'dotenv'

dotenv.config()
const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env

const redis = new Redis({
    port: REDIS_PORT as unknown as number,
    host: REDIS_HOST,
    password: REDIS_PASSWORD,
})

export default redis