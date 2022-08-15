// user in Redis
export type AuthUser = {
	email: string
	passwordHash: number
}

// user in MondoDB
export type User = {
	email: string
	name: string
	username: string
	avatar: string
	recipes: Recipe[]
	favorites: string[]
}

type WriteUp = string

export type Tags = ('smoothie' | 'pizza' | 'meat')[]

type Review = {
	rating: number
	comment: string
	date: string
	author: string
}

export type Recipe = {
	id: string
	title: string
	description: string
	cover_image?: string
	tags: Tags
	content: (RecipeCardData | WriteUp)[]
	reviews?: Review[]
	visibility: 'public' | 'private' | 'unlisted'
}

type Time = {
	minutes: number
	hours: number
	days: number
}

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
