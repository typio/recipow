import Filter from 'bad-words'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'

import { dupKey, json, sql } from '$lib/server/db'
import { sessionUser } from '$lib/server/session'
import type { RequestHandler } from './$types'
import type { Recipe, RecipeCardData } from '$lib/types'
import { tags } from '$lib/tagData'

// rating isn't stored, it's averaged from reviews on read
const CARD_COLUMNS = `r.slug AS id, r.title, r.description, r.cover_image, r.tags, r.intensity, r.created_at AS createdAt, u.username,
    COALESCE(ROUND(AVG(v.rating), 2), 0) AS rating, COUNT(v.id) AS ratingCount`
const CARD_FROM = 'FROM recipes r JOIN users u ON u.id = r.user_id LEFT JOIN reviews v ON v.recipe_id = r.id'

type CardRow = {
    id: string
    title: string
    description: string
    cover_image: string | null
    tags: unknown
    intensity: number
    createdAt: Date
    username: string
    rating: number
    ratingCount: number
} & RowDataPacket

export const POST: RequestHandler = async ({ request }) => {
    const user = await sessionUser(request)
    if (!user) {
        return new Response(JSON.stringify({ message: 'You need to be logged in to post a recipe.' }), { status: 401 })
    }

    let recipe: Recipe = (await request.json()).recipe

    if (recipe.title.replace(/\W/g, '').length < 4) {
        return new Response(
            JSON.stringify({
                message: 'Title must be at least 4 characters.'
            }),
            { status: 400 }
        )
    }

    // slug column is 191 chars
    if (recipe.title.length > 100) {
        return new Response(JSON.stringify({ message: 'Title must be at most 100 characters.' }), { status: 400 })
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

    const slug = recipe.title.replace(/\s/g, '-').replace(/\s+/g, ' ').trim().replace(/\W/g, '').toLowerCase()

    try {
        await sql.query<ResultSetHeader>('INSERT INTO recipes (user_id, slug, title, description, cover_image, tags, intensity, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            user.id,
            slug,
            recipe.title,
            recipe.description,
            recipe.cover_image || null,
            JSON.stringify(recipe.tags),
            Number(recipe.intensity) || 1,
            JSON.stringify(recipe.content)
        ])
    } catch (err) {
        if (dupKey(err) === 'uniq_user_slug') {
            return new Response(JSON.stringify({ message: 'You already have a recipe with this title.' }), {
                status: 400
            })
        }
        throw err
    }

    return new Response(
        JSON.stringify({
            url: `/@${user.username}/recipe-${slug}`
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
        const [[row]] = await sql.query<(CardRow & { content: unknown })[]>(
            `SELECT ${CARD_COLUMNS}, r.content ${CARD_FROM} WHERE u.username = ? AND r.slug = ? GROUP BY r.id, u.username`,
            [username, id]
        )

        if (row) {
            const { username: _, ...recipe } = row
            return new Response(JSON.stringify({ recipe: { ...recipe, tags: json(row.tags), content: json(row.content) } }), {
                status: 200
            })
        }

        return new Response(JSON.stringify({ message: 'Recipe not found.' }), {
            status: 404
        })
    }

    // getting a list of recipe previews with their links
    const page = Math.max(1, parseInt(searchParams.get('page') || '') || 1)
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '') || 10))

    let where = ''
    let order = 'r.created_at DESC'
    const params: unknown[] = []

    if (type === 'trending') {
        order = 'COALESCE(AVG(v.rating), 0) / UNIX_TIMESTAMP(r.created_at) DESC'
    } else if (type === 'search') {
        const search = searchParams.get('search') || ''
        if (search.replace(/\W+/g, '') == '') {
            return new Response(JSON.stringify({ recipesAndLinks: [] }), { status: 200 })
        }
        // escape like wildcards so "%" searches for a literal %
        where = 'WHERE r.title LIKE ?'
        params.push(`%${search.replace(/[\\%_]/g, '\\$&')}%`)
    } else if (type === 'user') {
        where = 'WHERE u.username = ?'
        params.push(searchParams.get('username') || '')
        order = 'r.created_at ASC'
    }

    const [rows] = await sql.query<CardRow[]>(`SELECT ${CARD_COLUMNS} ${CARD_FROM} ${where} GROUP BY r.id, u.username ORDER BY ${order} LIMIT ? OFFSET ?`, [
        ...params,
        limit,
        (page - 1) * limit
    ])

    const recipesAndLinks = rows.map(({ username, ...recipe }) => ({
        recipe: { ...recipe, tags: json(recipe.tags) },
        link: `/@${username}/recipe-${recipe.id}`
    }))

    return new Response(JSON.stringify({ recipesAndLinks }), { status: 200 })
}

export const DELETE: RequestHandler = async ({ request }) => {
    const user = await sessionUser(request)
    if (!user) {
        return new Response(JSON.stringify({ message: 'You need to be logged in.' }), { status: 401 })
    }

    const { recipeId } = await request.json()

    // only your own recipe, its reviews go with it (on delete cascade)
    const [res] = await sql.query<ResultSetHeader>('DELETE FROM recipes WHERE user_id = ? AND slug = ?', [user.id, recipeId])

    if (!res.affectedRows) {
        return new Response(JSON.stringify({ message: 'Failed to find recipe.' }), { status: 404 })
    }

    return new Response(
        JSON.stringify({
            message: 'Recipe deleted.'
        }),
        { status: 200 }
    )
}
