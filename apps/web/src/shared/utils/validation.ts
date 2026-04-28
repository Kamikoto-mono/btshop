import {
  isTelegramLink,
  isValidTelegramUsername,
  normalizeTelegramInput
} from './telegram'

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateEmail = (value: string): true | string => {
  if (!value.trim()) {
    return 'Заполните email'
  }

  return EMAIL_REGEX.test(value.trim()) ? true : 'Введите корректный email'
}

export const validateRequired = (value: string, message: string): true | string => {
  return value.trim() ? true : message
}

export const validateTelegram = (
  value: string,
  {
    optional = false
  }: {
    optional?: boolean
  } = {}
): true | string => {
  const trimmed = value.trim()

  if (!trimmed) {
    return optional ? true : 'Укажите Telegram'
  }

  const normalized = isTelegramLink(trimmed)
    ? normalizeTelegramInput(trimmed)
    : trimmed.startsWith('@')
      ? trimmed
      : normalizeTelegramInput(trimmed)

  return isValidTelegramUsername(normalized)
    ? true
    : 'Укажите Telegram в формате @username или ссылкой t.me/username'
}
