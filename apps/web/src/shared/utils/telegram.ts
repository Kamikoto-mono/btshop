export const TELEGRAM_LINK_REGEX = /(^|\s)(https?:\/\/)?(t\.me|telegram\.me)\//i
export const TELEGRAM_USERNAME_REGEX = /^@[a-zA-Z0-9_]{5,32}$/
export const TELEGRAM_LINK_USERNAME_REGEX =
  /(https?:\/\/)?(t\.me|telegram\.me)\/@?([a-zA-Z0-9_]{5,32})/i

export const isTelegramLink = (value: string): boolean => {
  return TELEGRAM_LINK_REGEX.test(value.trim())
}

export const extractTelegramUsername = (value: string): string | null => {
  const match = value.trim().match(TELEGRAM_LINK_USERNAME_REGEX)

  if (!match) {
    return null
  }

  return `@${match[3]}`
}

export const normalizeTelegramInput = (value: string): string => {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  const fromLink = extractTelegramUsername(trimmed)

  if (fromLink) {
    return fromLink
  }

  const username = trimmed.replace(/^@+/, '')
  return `@${username}`
}

export const isValidTelegramUsername = (value: string): boolean => {
  return TELEGRAM_USERNAME_REGEX.test(value)
}
