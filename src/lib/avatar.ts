import placeholder from '$lib/assets/profile.svg'

// users without an uploaded avatar + anonymous reviewers
export const avatarSrc = (avatar: string | null | undefined) => avatar || placeholder
