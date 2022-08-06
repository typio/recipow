import { mongoClient } from '$lib/db'

export const get = async ({ params }) => {
    const { recipes } = (
        await mongoClient
            .db('recipow')
            .collection('users')
            .findOne({ username: params.username })
    )

    const recipe = recipes.find(recipe => recipe.id === params.recipe_id)

    if (recipe) {
        return {
            status: 200,
            body: {
                recipe,
                username: params.username
            }
        }
    }

    return {
        status: 404,
        body: {
            message: 'Recipe not found'
        }
    }
}