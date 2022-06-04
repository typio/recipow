// user in auth and Redis
export type authUser = {
    email: string,
    passwordHash: number,
}

// user in MondoDB
export type user = {
    id: string,
    name: string,
    email: string,
    avatar: string,
}