import Filter from 'bad-words'
import type { RowDataPacket } from 'mysql2'

import { sql } from '$lib/server/db'
import { sessionUser } from '$lib/server/session'
import type { RequestHandler } from './$types'

const filter = new Filter()

// @user + slug -> recipes.id
const recipeIdOf = async (username: string, slug: string) => {
    const [[row]] = await sql.query<({ id: number } & RowDataPacket)[]>('SELECT r.id FROM recipes r JOIN users u ON u.id = r.user_id WHERE u.username = ? AND r.slug = ?', [username, slug])
    return row?.id ?? null
}

const notFound = () => new Response(JSON.stringify({ message: 'Recipe not found.' }), { status: 404 })

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
    const clientAddress = getClientAddress()
    const res = await request.json()
    const { recipe, rating, comment } = res

    let recipeAuthor = recipe.split('/')[0].split('@')[1]
    let recipeId = recipe.split('/recipe-')[1]

    const id = await recipeIdOf(recipeAuthor, recipeId)
    if (!id) return notFound()

    // author comes from the session, anonymous reviews are keyed by ip
    const user = await sessionUser(request)

    let reviewRating = Number(rating) || 0
    if (reviewRating > 4.8) {
        reviewRating = 5
    } else if (reviewRating < 0.2) {
        reviewRating = 0.2
    } else {
        reviewRating = parseFloat(reviewRating.toFixed(1))
    }

    // one review per author per recipe, an empty comment keeps the previous one
    await sql.query(
        `INSERT INTO reviews (recipe_id, user_id, ip, rating, comment) VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = IF(VALUES(comment) IN ('', '<p></p>'), comment, VALUES(comment)), created_at = CURRENT_TIMESTAMP(3)`,
        [id, user?.id ?? null, user ? null : clientAddress, reviewRating, filter.clean(comment || '<p></p>')]
    )

    return new Response(null, { status: 200 })
}

type ReviewRow = {
    rating: number
    comment: string
    date: Date
    user_id: number | null
    ip: string | null
    username: string | null
    name: string | null
    avatar: string | null
} & RowDataPacket

export const GET: RequestHandler = async ({ request, url: { searchParams }, getClientAddress }) => {
    const clientAddress = getClientAddress()
    const recipe = searchParams.get('recipe') || ''

    let recipeAuthor = recipe.split('/')[0].split('@')[1]
    let recipeId = recipe.split('/')[1]

    const id = await recipeIdOf(recipeAuthor, recipeId)
    if (!id) return new Response(JSON.stringify({ reviews: [] }), { status: 200 })

    const user = await sessionUser(request)

    const [rows] = await sql.query<ReviewRow[]>(
        `SELECT v.rating, v.comment, v.created_at AS date, v.user_id, v.ip, u.username, u.name, u.avatar
         FROM reviews v LEFT JOIN users u ON u.id = v.user_id
         WHERE v.recipe_id = ? ORDER BY v.created_at DESC`,
        [id]
    )

    // ip + user_id never leave the server
    const reviews = rows.map(row => ({
        rating: row.rating.toFixed(1),
        comment: row.comment,
        date: row.date,
        author: row.user_id ? `<a href="/@${row.username}">${row.name}</a>` : '<a href="/about">Anonymous</a>',
        authorAvatar: row.avatar,
        leftByUser: user ? row.user_id === user.id : row.user_id === null && row.ip === clientAddress
    }))

    // your own review first, sort is stable so the rest stay newest first
    reviews.sort((a, b) => Number(b.leftByUser) - Number(a.leftByUser))

    return new Response(JSON.stringify({ reviews }), {
        status: 200
    })
}

export const DELETE: RequestHandler = async ({ request, url: { searchParams }, getClientAddress }) => {
    const clientAddress = getClientAddress()
    const recipe = searchParams.get('recipe') || ''

    let recipeAuthor = recipe.split('/')[0].split('@')[1]
    let recipeId = recipe.split('/')[1]

    const id = await recipeIdOf(recipeAuthor, recipeId)
    if (!id) return notFound()

    // only ever your own review, ?userEmail is ignored
    const user = await sessionUser(request)
    if (user) {
        await sql.query('DELETE FROM reviews WHERE recipe_id = ? AND user_id = ?', [id, user.id])
    } else {
        await sql.query('DELETE FROM reviews WHERE recipe_id = ? AND user_id IS NULL AND ip = ?', [id, clientAddress])
    }

    return new Response(JSON.stringify({ message: 'Review deleted' }), { status: 200 })
}
