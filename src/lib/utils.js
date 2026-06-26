import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
return twMerge(clsx(inputs))
}

export const formatPrice = (price) => `$${Number(price).toFixed(2)}`

export const truncate = (str, len = 60) => str.length > len ? str.slice(0, len) + '...' : str
