import Redis from "ioredis"

const { VITE_REDIS_PORT, VITE_REDIS_HOST, VITE_REDIS_PASSWORD } = import.meta.env

const redis = new Redis({
    port: VITE_REDIS_PORT,
    host: VITE_REDIS_HOST,
    password: VITE_REDIS_PASSWORD,
})

export default redis