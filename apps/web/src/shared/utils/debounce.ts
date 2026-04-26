type TDebouncedFunction<TArgs extends unknown[]> = ((
  ...args: TArgs
) => void) & {
  cancel: () => void
}

export const debounce = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
): TDebouncedFunction<TArgs> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: TArgs) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debounced
}
