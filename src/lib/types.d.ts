// user in Redis
export type AuthUser = {
	email: string
	passwordHash: number
}

// user in MondoDB
export type User = {
	ip: string
	email: string
	name: string
	username: string
	avatar: string
	recipes: Recipe[]
	favorites: string[]
}

type WriteUp = string

type Review = {
	rating: number
	comment: string
	date: string
	author: string
	authorAvatar?: string
	leftByUser?: boolean
}

import { tags } from 'tagData'

export type Recipe = {
	id: string
	title: string
	description: string
	cover_image?: string
	tags: typeof tags[number]
	content: (RecipeCardData | WriteUp)[]
	rating: number
	ratingCount: number
	reviews?: Review[]
	createdAt: string
	intensity: 1 | 2 | 3 | 4 | 5
	visibility: 'public' | 'private' | 'unlisted'
}

type Time = {
	minutes: number
	hours: number
	days: number
}

import { units } from 'unitData'

type Ingredient = {
	name: string
	amount: number
	unit?: typeof units[number]
	preperation?: string
}

export type RecipeCardData = {
	title?: string
	description?: string
	cover_image?: string
	ingredients: Ingredient[]
	steps: string[]
	times: { prep: Time; cook: Time }
	serves?: string
	yield: string
	notes?: string
	nutrition: {
		calories?: string
		protein?: string
		fat?: string
		carbs?: string
		sugar?: string
		fiber?: string
	}
}

// type for recipe get url params
export type RecipeGetParams = {
	type: 'feed' | 'favorites' | 'author'
	tags?: Tags
	page: number
	limit: number
}
