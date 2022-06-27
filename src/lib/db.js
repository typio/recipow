import Redis from 'ioredis'
import { MongoClient } from 'mongodb'

// used in git netflify with env vars in UI
let {
	VITE_REDIS_PORT,
	VITE_REDIS_HOST,
	VITE_REDIS_PASSWORD,
	VITE_MONGO_PASSWORD,
	VITE_MONGO_USERNAME,
	VITE_MONGO_CLUSTER
} = process.env

// used in local .env dev build
if (!VITE_REDIS_PORT) {
	({
		VITE_REDIS_PORT,
		VITE_REDIS_HOST,
		VITE_REDIS_PASSWORD,
		VITE_MONGO_PASSWORD,
		VITE_MONGO_USERNAME,
		VITE_MONGO_CLUSTER
	} = import.meta.env)
}

export const redis = new Redis({
	port: parseInt(VITE_REDIS_PORT ?? '6379'),
	host: VITE_REDIS_HOST ?? '',
	password: VITE_REDIS_PASSWORD ?? ''
})

const uri = `mongodb+srv://${VITE_MONGO_USERNAME}:${VITE_MONGO_PASSWORD}@${VITE_MONGO_CLUSTER}.bx9bt.mongodb.net/?retryWrites=true&w=majority`

export const mongoClient = new MongoClient(uri)