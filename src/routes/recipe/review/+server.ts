import * as cookie from 'cookie'
import Filter from 'bad-words'

import { redis, mongoClient } from '$lib/db'
import type { RequestHandler } from './$types'
import type { Recipe, Review, User } from '$lib/types'

const filter = new Filter()

export const POST: RequestHandler = async ({ request, clientAddress }) => {
    const res = await request.json()
    const { recipe, rating, comment } = res

    let recipeAuthor = (recipe.split('/')[0]).split('@')[1]
    let recipeId = recipe.split('/')[1]

    let review: Review = {
        rating: 4,
        comment: '<p></p>',
        date: '',
        author: ''
    }

    const email = JSON.parse(
        (await redis.get(cookie.parse(request.headers.get('cookie') || '').sessionId)) || '{}'
    ).email

    review.author = email ? email : `ip/${clientAddress}`
    review.date = new Date().toISOString()

    if (rating > 4.8) {
        review.rating = 5
    } else if (rating < .2) {
        review.rating = .2
    } else {
        review.rating = parseFloat(rating.toFixed(2))
    }

    review.comment = filter.clean(comment || '<p></p>')

    let oldRatings = (await mongoClient.db('recipow')
        .collection('users')
        .findOne(
            { "username": recipeAuthor },
        ))?.recipes.find((r: Recipe) => r.id === recipeId)?.reviews || []

    // check if user already reviewed this recipe
    if (oldRatings.map((rev: Review) => rev.author).includes(review.author)) {
        let previousReview = oldRatings.find((rev: Review) => { return rev.author === review.author })
        // update their review
        if (comment === '' || comment === '<p></p>' || comment === undefined) {
            review.comment = previousReview.comment
        }

        await mongoClient
            .db('recipow')
            .collection('users')
            .updateOne(
                { "username": recipeAuthor },
                {
                    "$set":
                    {
                        "recipes.$[i].reviews.$[j]":
                            review
                    }
                },
                {
                    arrayFilters: [
                        { 'i.id': recipeId, },
                        { 'j.author': review.author, }
                    ],
                },
            )
    } else {
        // check if user has already reviewed this recipe with ip
        if (review.author.split('/')[0] === 'ip') {

            // check if user has already reviewed this recipe with username
        } //else if () {

        // }
        // post their review
        await mongoClient
            .db('recipow')
            .collection('users')
            .updateOne(
                { "username": recipeAuthor },
                {
                    "$push":
                    {
                        "recipes.$[i].reviews": {
                            "$each": [review],
                            "$position": 0
                        }
                    }
                },
                {
                    arrayFilters: [
                        { 'i.id': recipeId, },
                    ],
                },
            )
    }

    let newRatings = (await mongoClient.db('recipow')
        .collection('users')
        .findOne(
            { "username": recipeAuthor },
        ))?.recipes.find((r: Recipe) => r.id === recipeId)?.reviews || []


    await mongoClient
        .db('recipow')
        .collection('users')
        .updateOne(
            { "username": recipeAuthor },
            {
                "$set":
                {
                    "recipes.$[i].rating": parseFloat(((newRatings.reduce((a: number, b: any) => a + b.rating, 0)) / (newRatings.length)).toFixed(2)),
                    "recipes.$[i].ratingCount": (newRatings.length),

                }
            },
            {
                arrayFilters: [
                    { 'i.id': recipeId, },
                ],
            },
        )



    return new Response(null, { status: 200 })
}

export const GET: RequestHandler = async ({ url: { searchParams }, clientAddress }) => {
    const recipe = searchParams.get('recipe') || ''
    const page = parseInt(searchParams.get('page') || '') || 1
    const limit = parseInt(searchParams.get('limit') || '') || 10
    const userEmailOrIP = (searchParams.get('userEmail') !== 'undefined' ? searchParams.get('userEmail') : ('ip/' + clientAddress))

    let recipeAuthor = (recipe.split('/')[0]).split('@')[1]
    let recipeId = recipe.split('/')[1]

    let reviews: Review[] = []

    reviews = (await mongoClient.db('recipow')
        .collection('users')
        .findOne(
            { "username": recipeAuthor },
        ))?.recipes
        .find((r: Recipe) => r.id === recipeId)?.reviews

    let userReview = reviews.find(rev => rev.author === userEmailOrIP)

    if (userReview) {
        reviews = reviews.filter(review => review.author !== userEmailOrIP)
        userReview.leftByUser = true
        reviews.unshift(userReview)
    }

    reviews.slice((page - 1) * limit, page * limit) || []

    for (let review of reviews) {
        let author = review.author
        let name = 'Unknown'
        let username = 'about'
        let avatar = `https://recipow.s3.us-west-1.amazonaws.com/avatars/default_avatar_${Math.floor(Math.random() * 3) + 1}.png`

        if (author.split('/')[0] === 'ip') {
            name = 'Anonymous'
        } else {
            try {
                ({ username, name, avatar } = (await mongoClient.db('recipow').collection('users').findOne<User>({ email: author })) ?? { username: '', name: '', avatar: '' })
                username = '@' + username
            } catch (e) {
                console.log(e)
            }

        }
        review.author = `<a href="/${username}">${name}</a>`
        review.authorAvatar = avatar
    }

    reviews.sort((a: Review, b: Review) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return new Response(JSON.stringify({ reviews }), {
        status: 200
    })
}


export const DELETE: RequestHandler = async ({ url: { searchParams }, clientAddress }) => {
    const recipe = searchParams.get('recipe') || ''
    const userEmailOrIP = (searchParams.get('userEmail') !== 'undefined' ? searchParams.get('userEmail') : ('ip/' + clientAddress))

    let recipeAuthor = (recipe.split('/')[0]).split('@')[1]
    let recipeId = recipe.split('/')[1]

    const res = (await mongoClient.db('recipow')
        .collection('users')
        .updateOne(
            { "username": recipeAuthor },
            {
                "$pull":
                    { "recipes.$[i].reviews": { "author": userEmailOrIP } }
            },

            {
                arrayFilters: [
                    { 'i.id': recipeId },
                ],
            }
        ))

    let newRatings = (await mongoClient.db('recipow')
        .collection('users')
        .findOne(
            { "username": recipeAuthor },
        ))?.recipes.find((r: Recipe) => r.id === recipeId)?.reviews || []


    await mongoClient
        .db('recipow')
        .collection('users')
        .updateOne(
            { "username": recipeAuthor },
            {
                "$set":
                {
                    "recipes.$[i].rating": (newRatings.reduce((a: number, b: any) => a + b.rating, 0)) / (newRatings.length),
                    "recipes.$[i].ratingCount": (newRatings.length),

                }
            },
            {
                arrayFilters: [
                    { 'i.id': recipeId, },
                ],
            },
        )

    return new Response(JSON.stringify({ message: 'Review deleted' }), { status: 200 })
}