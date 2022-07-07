export const TOKEN_EXPIRE_TIME = 60 * 60 * 24 * 1 // 1 days

export const validateEmail = (/** @type {any} */ email) => {
    if (typeof email !== 'string' ||
        !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return false
    }

    return true
}

export const validatePassword = (/** @type {any} */ password) => {
    // require password with one lowercase, one uppercase, and one number
    if (typeof password !== 'string' ||
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
        return false
    }

    return true
}

