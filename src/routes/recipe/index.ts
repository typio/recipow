import * as cookie from 'cookie'
import jimp from 'jimp'
import { Upload } from '@aws-sdk/lib-storage'
import { PutObjectTaggingCommand, Tag } from '@aws-sdk/client-s3'

import { redis, mongoClient, s3Client } from '$lib/db'
import type { RequestHandler } from '.svelte-kit/types/src/routes/recipe/__types/index'
import type { Recipe, RecipeCardData } from '$lib/types'

export const updateS3Tags = async (key: string | undefined, tagset: Tag[]) => {
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

export const post: RequestHandler = async ({ request }) => {
	let { recipe } = await request.json()

	recipe.reviews = { rating: 0, reviewCount: 0 }

	if (recipe.title.length < 4) {
		return {
			status: 400,
			body: {
				message: 'Title must be at least 4 characters.'
			}
		}
	}

	recipe.id = recipe.title
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\W/g, '')
		.replace(/\s/g, '-')
		.toLowerCase()

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
			const imageURLs = content.match(
				/https:\/\/recipow.s3.us-west-1.amazonaws.com\/.[^"<>]*\.png/g
			)
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
		return {
			status: 400,
			body: {
				message: 'You already have a recipe with this title.'
			}
		}
	}

	const email = JSON.parse(
		(await redis.get(cookie.parse(request.headers.get('cookie') || '').sessionId)) || '{}'
	).email

	const { username } = await mongoClient.db('recipow').collection('users').findOne({ email })

	mongoClient
		.db('recipow')
		.collection('users')
		.updateOne(
			{ email },
			{
				$push: { recipes: recipe }
			}
		)

	return {
		status: 200,
		body: {
			url: `/@${username}/${recipe.id}`
		}
	}
}

export const get = async ({ url: { searchParams }, locals }) => {
	const type = searchParams.get('type') || 'feed'
	const page = parseInt(searchParams.get('page') || '1')
	const limit = parseInt(searchParams.get('limit') || '10')

	type RecipeAndLink = {
		recipe: Recipe
		link: string
	}

	let recipesAndLinks: RecipeAndLink[] = []

	{
		;[
			...(await mongoClient
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
				.toArray())
		].forEach(x => {
			;[...x.recipes].forEach(y => {
				recipesAndLinks.push({ recipe: y, link: `/@${x.username}/${y.id}` })
			})
		})
	}

	return {
		status: 200,
		body: {
			recipesAndLinks
		}
	}
}

export const del = async ({ request }) => {
	const { recipeId } = await request.json()

	const email = JSON.parse(
		(await redis.get(cookie.parse(request.headers.get('cookie') || '').sessionId)) || '{}'
	).email

	const { username } = await mongoClient.db('recipow').collection('users').findOne({ email })

	const { recipes } = await mongoClient.db('recipow').collection('users').findOne({ username })

	const recipe = recipes.find(recipe => recipe.id === recipeId)

	// replace tag on each image
	if (recipe.cover_image) {
		const imageKey = recipe.cover_image?.split('.com/')[1]
		updateS3Tags(imageKey, [{ Key: 'isTemp', Value: 'true' }])
	}

	recipe.content.forEach((content: string | RecipeCardData) => {
		if (typeof content === 'object') {
			if (content.cover_image) {
				const imageKey = content?.cover_image?.split('.com/')[1]
				console.log(imageKey)

				updateS3Tags(imageKey, [{ Key: 'isTemp', Value: 'true' }])
			}
		} else {
			const imageURLs = content.match(
				/https:\/\/recipow.s3.us-west-1.amazonaws.com\/.[^"<>]*\.png/g
			)
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

	return {
		status: 200,
		body: {
			message: 'Recipe deleted.'
		}
	}
}
