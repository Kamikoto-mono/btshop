'use client'

import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState
} from 'react'

import styles from './OtpCode.module.scss'

interface IOtpCodeProps {
  errorMessage?: string
  initialSeconds?: number
  invalid?: boolean
  length?: number
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  onResend?: () => Promise<boolean | void> | boolean | void
  resendLabel?: string
  resendLabelWithCounter?: (secondsLeft: number) => string
  resetKey?: string | number
}

export const OtpCode = ({
  errorMessage,
  initialSeconds = 27,
  invalid = false,
  length = 6,
  onChange,
  onComplete,
  onResend,
  resendLabel = 'Отправить код повторно',
  resendLabelWithCounter = (secondsLeft) => `Отправить код повторно (${secondsLeft})`,
  resetKey
}: IOtpCodeProps) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const [values, setValues] = useState<string[]>(() =>
    Array.from({ length }, () => '')
  )
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    setValues(Array.from({ length }, () => ''))
    setFocusedIndex(0)
    setSecondsLeft(initialSeconds)

    window.setTimeout(() => {
      inputRefs.current[0]?.focus()
    }, 0)
  }, [initialSeconds, length, resetKey])

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timerId)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [secondsLeft])

  useEffect(() => {
    const nextValue = values.join('')

    onChange?.(nextValue)

    if (values.every(Boolean)) {
      onComplete?.(nextValue)
    }
  }, [onChange, onComplete, values])

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus()
    setFocusedIndex(index)
  }

  const updateValue = (index: number, nextValue: string) => {
    const digit = nextValue.replace(/\D/g, '').slice(-1)

    setValues((current) => {
      const next = [...current]
      next[index] = digit
      return next
    })

    if (digit && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handleChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    updateValue(index, event.target.value)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (values[index]) {
        setValues((current) => {
          const next = [...current]
          next[index] = ''
          return next
        })
        return
      }

      if (index > 0) {
        setValues((current) => {
          const next = [...current]
          next[index - 1] = ''
          return next
        })
        focusInput(index - 1)
      }
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1)
    }

    if (event.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length)

    if (!pasted) {
      return
    }

    event.preventDefault()

    setValues((current) => {
      const next = [...current]

      pasted.split('').forEach((digit, index) => {
        next[index] = digit
      })

      return next
    })

    focusInput(Math.min(pasted.length, length) - 1)
  }

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) {
      return
    }

    try {
      setIsResending(true)
      const result = await onResend?.()

      if (result === false) {
        return
      }

      setValues(Array.from({ length }, () => ''))
      setSecondsLeft(initialSeconds)
      focusInput(0)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid} onPaste={handlePaste}>
        {values.map((value, index) => {
          const isFocused = focusedIndex === index
          const isEmpty = !value
          const showDot = isEmpty && !isFocused

          return (
            <label
              className={[
                isFocused ? styles.cellActive : styles.cell,
                invalid ? styles.cellInvalid : ''
              ]
                .filter(Boolean)
                .join(' ')}
              key={index}
              onClick={() => focusInput(index)}
            >
              <input
                aria-label={`Символ кода ${index + 1}`}
                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                className={styles.input}
                inputMode='numeric'
                maxLength={1}
                onChange={(event) => handleChange(index, event)}
                onFocus={() => setFocusedIndex(index)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                ref={(node) => {
                  inputRefs.current[index] = node
                }}
                type='text'
                value={value}
              />
              {showDot ? <span aria-hidden className={styles.dot} /> : null}
            </label>
          )
        })}
      </div>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <button
        className={styles.timer}
        disabled={secondsLeft > 0 || isResending}
        onClick={() => void handleResend()}
        type='button'
      >
        {secondsLeft > 0
          ? resendLabelWithCounter(secondsLeft)
          : isResending
            ? 'Отправляем...'
            : resendLabel}
      </button>
    </div>
  )
}
