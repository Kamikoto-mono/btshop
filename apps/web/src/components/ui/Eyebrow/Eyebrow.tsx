import { ElementType, ReactNode } from 'react'

import { StatusDot } from '../StatusDot/StatusDot'
import styles from './Eyebrow.module.scss'

interface IEyebrowProps {
  as?: ElementType
  children: ReactNode
  className?: string
  dot?: boolean
}

export const Eyebrow = ({
  as: Component = 'p',
  children,
  className,
  dot = false
}: IEyebrowProps) => (
  <Component className={className ? `${styles.eyebrow} ${className}` : styles.eyebrow}>
    {dot ? <StatusDot /> : null}
    {children}
  </Component>
)
