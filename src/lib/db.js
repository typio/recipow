import Redis from 'ioredis'
import { MongoClient } from 'mongodb'

const {
	VITE_REDIS_PORT,
	VITE_REDIS_HOST,
	VITE_REDIS_PASSWORD,
	VITE_MONGO_PASSWORD,
	VITE_MONGO_USERNAME,
	VITE_MONGO_CLUSTER
} = import.meta.env

const redis = new Redis({
	port: VITE_REDIS_PORT,
	host: VITE_REDIS_HOST,
	password: VITE_REDIS_PASSWORD
})

const uri = `mongodb+srv://${VITE_MONGO_USERNAME}:${VITE_MONGO_PASSWORD}@${VITE_MONGO_CLUSTER}`
const client = new MongoClient(uri)
client.connect(err => {
	const collection = client.db('test').collection('devices')
	// perform actions on the collection object
	client.close()
})

export default redis
