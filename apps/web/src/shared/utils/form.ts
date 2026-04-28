import { normalizeTelegramInput } from './telegram'

export const normalizeEmail = (value: string): string => value.trim().toLowerCase()

export const normalizeText = (value: string): string => value.trim()

export const normalizeTelegramField = (value: string): string => {
  const trimmed = value.trim()
  return trimmed ? normalizeTelegramInput(trimmed) : ''
}
