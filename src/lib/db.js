import Redis from 'ioredis'
import { MongoClient } from 'mongodb'
import { S3Client } from '@aws-sdk/client-s3'

// used in git vercel with env vars in UI
let {
	VITE_REDIS_PORT,
	VITE_REDIS_HOST,
	VITE_REDIS_PASSWORD,
	VITE_MONGO_PASSWORD,
	VITE_MONGO_USERNAME,
	VITE_MONGO_CLUSTER,
	VITE_AWS_ACCESS_KEY_ID,
	VITE_AWS_SECRET_ACCESS_KEY,
} = process.env

// used in local .env dev build
if (!VITE_REDIS_PORT) {
	({
		VITE_REDIS_PORT,
		VITE_REDIS_HOST,
		VITE_REDIS_PASSWORD,
		VITE_MONGO_PASSWORD,
		VITE_MONGO_USERNAME,
		VITE_MONGO_CLUSTER,
		VITE_AWS_ACCESS_KEY_ID,
		VITE_AWS_SECRET_ACCESS_KEY,
	} = import.meta.env)
}

export const redis = new Redis({
	port: parseInt(VITE_REDIS_PORT ?? '6379'),
	host: VITE_REDIS_HOST ?? '',
	password: VITE_REDIS_PASSWORD ?? ''
})

const uri = `mongodb+srv://${VITE_MONGO_USERNAME}:${VITE_MONGO_PASSWORD}@${VITE_MONGO_CLUSTER}.bx9bt.mongodb.net/?retryWrites=true&w=majority`

export const mongoClient = new MongoClient(uri)

export const s3Client = new S3Client({
	region: "us-west-1",
	credentials: {
		accessKeyId: VITE_AWS_ACCESS_KEY_ID ?? '',
		secretAccessKey: VITE_AWS_SECRET_ACCESS_KEY ?? ''
	}
})
