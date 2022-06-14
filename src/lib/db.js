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

// export const redis = new Redis({
// 	port: 11949,
// 	host: "redis-11949.c60.us-west-1-2.ec2.cloud.redislabs.com",
// 	password: "PtkyD8GZrYWT5XZqDaZXDmZL7EiCPhOh"
// })

const uri = `mongodb+srv://${VITE_MONGO_USERNAME}:${VITE_MONGO_PASSWORD}@${VITE_MONGO_CLUSTER}.bx9bt.mongodb.net`

export const mongoClient = await (async (uri) => {
	let mongoClient

	try {
		mongoClient = new MongoClient(uri)
		console.log('Connecting to MongoDB Atlas cluster...')
		await mongoClient.connect()
		console.log('Successfully connected to MongoDB Atlas!')

		return mongoClient
	} catch (error) {
		console.error('Connection to MongoDB Atlas failed!', error)
		process.exit()
	}
})(uri)