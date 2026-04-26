import styles from './StatusDot.module.scss'

type StatusDotVariant = 'pulse' | 'blink'

interface IStatusDotProps {
  variant?: StatusDotVariant
}

export const StatusDot = ({ variant = 'pulse' }: IStatusDotProps) => (
  <span
    aria-hidden='true'
    className={`${styles.dot} ${variant === 'blink' ? styles.blink : styles.pulse}`}
  />
)
