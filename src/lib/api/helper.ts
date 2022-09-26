import Filter from 'bad-words'

import { mongoClient } from '$lib/db'

const filter = new Filter()

export const TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 7 // 7 days

export const validateEmail = (email: string): { success: boolean; msg?: string } => {
	if (typeof email !== 'string' || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
		return { success: false, msg: 'Invalid email.' }
	}

	if (filter.isProfane(email)) {
		return { success: false, msg: 'Email contains profanity.' }
	}

	return { success: true }
}

export const validatePassword = (password: string): { success: boolean; msg?: string } => {
	// require password with one lowercase, one uppercase, and one number
	if (typeof password !== 'string' || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
		return { success: false, msg: "Password doesn't meet requirements." }
	}

	return { success: true }
}

export const validateName = (name: string): { success: boolean; msg?: string } => {
	if (name.length < 2) {
		return { success: false, msg: 'Name is too short. Must be at least 2 characters.' }
	}

	if (name.length > 35) {
		return { success: false, msg: 'Name is too long. Must be at most 35 characters.' }
	}

	if (filter.isProfane(name)) {
		return { success: false, msg: 'Name contains profanity.' }
	}
	return { success: true }
}

export const validateUsername = async (username: string): Promise<{ success: boolean; msg?: string | undefined }> => {
	if (username.length < 2) {
		return { success: false, msg: 'Username is too short.' }
	}

	if (username.length > 30) {
		return { success: false, msg: 'Username is too long.' }
	}

	if (filter.isProfane(username)) {
		return { success: false, msg: 'Username contains profanity.' }
	}

	if (username.includes(' ')) {
		return { success: false, msg: "Username can't have spaces." }
	}

	const res = await mongoClient.db('recipow').collection('users').find({ username }).toArray()

	if (res.length > 0) {
		return { success: false, msg: 'Username is being used by someone else.' }
	}

	return { success: true }
}
