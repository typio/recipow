// user in auth and Redis
export type AuthUser = {
    email: string,
    passwordHash: number,
}

// user in MondoDB
export type User = {
    id: string,
    name: string,
    email: string,
    avatar: string,
}

type WriteUp = string

export type Recipe = {
    title: string,
    description: string,
    cover_image_url?: string,
    tags: string[],
    content: (RecipeCardData | WriteUp)[],
    reviews: { rating: number, reviewCount: number },
    visibility: 'public' | 'private' | 'unlisted',
}

export type RecipeCardData = {
    title?: string,
    description?: string,
    cover_image_url?: string,
    ingredients: string[],
    steps: string[],
    times: {prep: number, cook: number, total: number},
    serves?: { min: number, max: number },
    yield: { quantity: number, unit: string },
    notes?: string,
}