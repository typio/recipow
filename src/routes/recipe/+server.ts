import * as cookie from 'cookie'
import { PutObjectTaggingCommand, Tag } from '@aws-sdk/client-s3'
import Filter from 'bad-words'

import { redis, mongoClient, s3Client } from '$lib/db'
import type { RequestHandler } from './$types'
import type { Recipe, RecipeCardData, User } from '$lib/types'
import { tags } from '$lib/tagData'

 const updateS3Tags = async (key: string | undefined, tagset: Tag[]) => {
	try {
		const result = await s3Client.send(
			new PutObjectTaggingCommand({
				Bucket: 'recipow',
				Key: key,
				Tagging: { TagSet: tagset }
			})
		)
		console.log('S3 result: ', result)
	} catch (err) {
		console.log('Failed to delete avatar from S3, error: ', err)
	}
}

export const POST: RequestHandler = async ({ request }) => {
	let recipe: Recipe = (await request.json()).recipe

	recipe.reviews = []
	recipe.rating = 0
	recipe.createdAt = new Date().toISOString()

	if (recipe.title.replace(/\W/g, '').length < 4) {
		return new Response(
			JSON.stringify({
				message: 'Title must be at least 4 characters.'
			}),
			{ status: 400 }
		)
	}

	let error = ''
	const filter = new Filter()

	if (filter.isProfane(recipe.title)) {
		error = 'Title contains profanity.'
	}
	recipe.description = recipe.description ? filter.clean(recipe.description) : ''

	recipe.intensity = recipe.intensity > 5 ? 5 : recipe.intensity
	recipe.intensity = recipe.intensity < 1 ? 1 : recipe.intensity

	recipe.tags = recipe.tags.filter((tag: string) => {
		return tags.includes(tag)
	})

	recipe.content.forEach((c: string | RecipeCardData) => {
		if (typeof c === 'object') {
			// check time values
			if (c.times.cook.hours > 23 || c.times.prep.hours > 23) {
				error = 'Time cannot be more than 23 hours.'
			}
			if (c.times.cook.minutes > 59 || c.times.prep.minutes > 59) {
				error = 'Time cannot be more than 59 minutes.'
			}
			if (c.times.cook.days < 0 || c.times.prep.days < 0 || c.times.cook.hours < 0 || c.times.prep.hours < 0 || c.times.cook.minutes < 0 || c.times.prep.minutes < 0) {
				error = 'Time cannot be negative.'
			}
			// check if servings is a number
			c.serves = c.serves?.replace(/[^0-9.]/g, '')
			if (c.serves === undefined || c.serves === '') {
				error = 'Servings must be a number.'
			}
			// check if yield is a number
			c.yield = c.yield?.replace(/[^0-9.]/g, '')

			// check if there are instructions
			if (c.steps.length === 0) {
				error = 'Instructions must be provided.'
			} else {
				for (let step of c.steps) {
					step = filter.clean(step)
				}
			}

			// check if there are ingredients
			if (c.ingredients.length === 0) {
				error = 'Ingredients must be provided.'
			} else {
				for (let ingredient of c.ingredients) {
					ingredient.name = filter.clean(ingredient.name)
					ingredient.preperation = ingredient.preperation ? filter.clean(ingredient.preperation) : undefined
				}
			}
		} else {
			if (['<p></p>', '', undefined, null].includes(c.replace(/\s+/g, ''))) {
				error = 'Write Up must have content if provided.'
			} else {
				c = filter.clean(c)
			}
		}
	})

	if (error !== '') {
		return new Response(JSON.stringify({ message: error }), { status: 400 })
	}

	recipe.id = recipe.title.replace(/\s/g, '-').replace(/\s+/g, ' ').trim().replace(/\W/g, '').toLowerCase()

	// replace tag on each image
	if (recipe.cover_image) {
		const imageKey = recipe.cover_image?.split('.com/')[1]
		updateS3Tags(imageKey, [{ Key: 'isTemp', Value: 'false' }])
	}

	recipe.content.forEach((content: string | RecipeCardData) => {
		if (typeof content === 'object') {
			if (content.cover_image) {
				const imageKey = content?.cover_image?.split('.com/')[1]
				console.log(imageKey)

				updateS3Tags(imageKey, [{ Key: 'isTemp', Value: 'false' }])
			}
		} else {
			const imageURLs = content.match(/https:\/\/recipow.s3.us-west-1.amazonaws.com\/.[^"<>]*\.png/g)
			imageURLs?.forEach((imageURL: string) => {
				const imageKey = imageURL.split('.com/')[1]
				updateS3Tags(imageKey, [{ Key: 'isTemp', Value: 'false' }])
			})
		}
	})

	if (
		(
			await mongoClient
				.db('recipow')
				.collection('users')
				.find({ recipes: { $elemMatch: { id: recipe.id } } })
				.toArray()
		).length > 0
	) {
		return new Response(JSON.stringify({ message: 'You already have a recipe with this title.' }), {
			status: 400
		})
	}

	const email = JSON.parse((await redis.get(cookie.parse(request.headers.get('cookie') || '').sessionId)) || '{}').email

	const { username } = (await mongoClient.db('recipow').collection('users').findOne<User>({ email })) ?? { username: '' }

	mongoClient
		.db('recipow')
		.collection('users')
		.updateOne(
			{ email },
			{
				$push: { recipes: recipe }
			}
		)

	return new Response(
		JSON.stringify({
			url: `/@${username}/${recipe.id}`
		}),
		{ status: 200 }
	)
}

export const GET: RequestHandler = async ({ url: { searchParams } }: { url: URL }) => {
	const type = searchParams.get('type') || 'recent'

	// getting one full recipe
	if (type === 'one') {
		const username = searchParams.get('username') || ''
		const id = searchParams.get('id') || ''
		const user = await mongoClient.db('recipow').collection('users').findOne({ username })

		if (user) {
			const recipe = user.recipes.find((recipe: Recipe) => recipe.id === id)
			if (recipe) {
				return new Response(JSON.stringify({ recipe }), {
					status: 200
				})
			}
		}

		return new Response(JSON.stringify({ message: 'Recipe not found.' }), {
			status: 404
		})
	}

	// getting a list of recipe previews with their links
	const page = parseInt(searchParams.get('page') || '') || 1
	const limit = parseInt(searchParams.get('limit') || '') || 10

	type RecipeAndLink = {
		recipe: {
			id: string
			title: string
			description: string
			cover_image?: string
			tags: Tag[]
			intensity: number
			createdAt: string
			rating: number
			ratingCount: number
		}
		link: string
	}

	let recipesAndLinks: RecipeAndLink[] = []

	const usersWithRecipes = await mongoClient
		.db('recipow')
		.collection('users')
		.aggregate([
			{
				$match: {
					$expr: {
						$getField: 'recipes'
					}
				}
			}
		])
		.toArray()

	for (const user of usersWithRecipes) {
		for (const recipe of user.recipes) {
			recipesAndLinks.push({
				recipe: {
					id: recipe.id,
					title: recipe.title,
					description: recipe.description,
					cover_image: recipe.cover_image,
					tags: recipe.tags,
					intensity: recipe.intensity,
					createdAt: recipe.createdAt,
					rating: recipe.rating,
					ratingCount: recipe.ratingCount
				},
				link: `/@${user.username}/recipe-${recipe.id}`
			})
		}
	}

	if (type === 'trending') {
		recipesAndLinks = recipesAndLinks
			.sort((a, b) => {
				let aScore = a.recipe.rating / new Date(a.recipe.createdAt).getTime()
				let bScore = b.recipe.rating / new Date(b.recipe.createdAt).getTime()
				return bScore - aScore
			})
			.slice((page - 1) * limit, page * limit)
	} else if (type === 'search') {
		const search = searchParams.get('search') || ''
		if (search.replace(/\W+/g, '') == '') {
			recipesAndLinks = []
		} else {
			recipesAndLinks = recipesAndLinks
				.filter(({ recipe }) => {
					return recipe.title.toLowerCase().includes(search.toLowerCase())
				})
				.slice((page - 1) * limit, page * limit)
		}
	} else if (type === 'user') {
		const username = searchParams.get('username') || ''
		const user = await mongoClient.db('recipow').collection('users').findOne<User>({ username })

		if (user !== null && user?.recipes?.length > 0) {
			recipesAndLinks = []
			for (const recipe of user.recipes) {
				recipesAndLinks.push({
					recipe: {
						id: recipe.id,
						title: recipe.title,
						description: recipe.description,
						cover_image: recipe.cover_image,
						tags: recipe.tags,
						intensity: recipe.intensity,
						createdAt: recipe.createdAt,
						rating: recipe.rating,
						ratingCount: recipe.ratingCount
					},
					link: `/@${user.username}/recipe-${recipe.id}`
				})
			}

			recipesAndLinks = recipesAndLinks?.slice((page - 1) * limit, page * limit)
		} else {
			recipesAndLinks = []
		}
	}
	// else if (type === 'tag') {
	// 	const tag = searchParams.get('tag') || ''
	// 	recipesAndLinks = recipesAndLinks.filter((recipesAndLink) => {
	// 		return recipesAndLink.recipe.tags.includes(tag)
	// 	}).slice(0, limit)
	// }
	else {
		// recent
		recipesAndLinks = recipesAndLinks
			.sort((a, b) => {
				let aScore = new Date(a.recipe.createdAt).getTime()
				let bScore = new Date(b.recipe.createdAt).getTime()
				return bScore - aScore
			})
			.slice((page - 1) * limit, page * limit)
	}

	return new Response(JSON.stringify({ recipesAndLinks }), { status: 200 })
}

export const DELETE: RequestHandler = async ({ request, clientAddress }) => {
	const { recipeId } = await request.json()

	const email = JSON.parse((await redis.get(cookie.parse(request.headers.get('cookie') || '').sessionId)) || '{}').email

	const { username } = (await mongoClient.db('recipow').collection('users').findOne<User>({ email })) ?? { username: '' }

	const { recipes } = (await mongoClient.db('recipow').collection('users').findOne<User>({ username })) ?? { recipes: [] }

	const recipe = recipes.find((recipe: Recipe) => recipe.id === recipeId)

	if (!recipe) {
		return new Response(JSON.stringify({ message: 'Failed to find recipe.' }), { status: 500 })
	}

	// replace tag on each image
	if (recipe?.cover_image) {
		const imageKey = recipe.cover_image?.split('.com/')[1]
		updateS3Tags(imageKey, [{ Key: 'isTemp', Value: 'true' }])
	}

	recipe?.content.forEach((content: string | RecipeCardData) => {
		if (typeof content === 'object') {
			if (content.cover_image) {
				const imageKey = content?.cover_image?.split('.com/')[1]
				console.log(imageKey)
				updateS3Tags(imageKey, [{ Key: 'isTemp', Value: 'true' }])
			}
		} else {
			const imageURLs = content.match(/https:\/\/recipow.s3.us-west-1.amazonaws.com\/.[^"<>]*\.png/g)
			imageURLs?.forEach((imageURL: string) => {
				const imageKey = imageURL.split('.com/')[1]
				updateS3Tags(imageKey, [{ Key: 'isTemp', Value: 'true' }])
			})
		}
	})

	await mongoClient
		.db('recipow')
		.collection('users')
		.updateOne(
			{ email },
			{
				$pull: { recipes: { id: recipeId } }
			}
		)

	return new Response(
		JSON.stringify({
			message: 'Recipe deleted.'
		}),
		{ status: 200 }
	)
}
