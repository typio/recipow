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

export type Recipe = {
	id: string
	title: string
	description: string
	cover_image_url?: string
	tags: Tags
	content: (RecipeCardData | WriteUp)[]
	reviews: { rating: number; reviewCount: number }
	visibility: 'public' | 'private' | 'unlisted'
}

type Time = {
	minutes: number
	hours: number
	days: number
}

export type RecipeCardData = {
	title?: string
	description?: string
	cover_image_url?: string
	ingredients: string[]
	steps: string[]
	times: { prep: Time; cook: Time }
	serves?: { min: number; max: number }
	yield: string
	notes?: string
}

// type for recipe get url params
export type RecipeGetParams = {
	type: 'feed' | 'favorites' | 'author'
	tags?: Tags
	page: number
	limit: number
}
