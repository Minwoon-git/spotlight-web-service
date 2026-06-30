const ADMIN_EMAILS = ['vvpp1593@gmail.com']

export const isAdmin = (user) => !!user?.email && ADMIN_EMAILS.includes(user.email)
