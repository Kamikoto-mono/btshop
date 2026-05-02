import type { CSSProperties } from 'react'
import type { StaticImageData } from 'next/image'

import chlorodehydromethyltestosteroneImage from '@assets/images/site-bg/chlorodehydromethyltestosterone.svg.png'
import nandroloneImage from '@assets/images/site-bg/Nandrolone.svg.png'
import testosteroneImage from '@assets/images/site-bg/Testosteron.svg.png'
import trenboloneImage from '@assets/images/site-bg/Trenbolone.svg.png'

import styles from './SiteBackground.module.scss'

interface ISiteBgFormula {
  className: string
  image: StaticImageData
}

const formulas: ISiteBgFormula[] = [
  { className: styles.formulaOne, image: testosteroneImage },
  { className: styles.formulaTwo, image: nandroloneImage },
  { className: styles.formulaThree, image: trenboloneImage },
  { className: styles.formulaFour, image: chlorodehydromethyltestosteroneImage },
  { className: styles.formulaFive, image: nandroloneImage },
  { className: styles.formulaSix, image: testosteroneImage },
  { className: styles.formulaSeven, image: chlorodehydromethyltestosteroneImage },
  { className: styles.formulaEight, image: trenboloneImage },
  { className: styles.formulaNine, image: testosteroneImage },
  { className: styles.formulaTen, image: nandroloneImage },
  { className: styles.formulaEleven, image: trenboloneImage },
  { className: styles.formulaTwelve, image: chlorodehydromethyltestosteroneImage }
]

export const SiteBackground = () => (
  <div aria-hidden='true' className={styles.background}>
    {formulas.map((formula, index) => (
      <div
        className={`${styles.formula} ${formula.className}`}
        key={`${formula.className}-${index}`}
        style={
          {
            '--formula-image': `url(${formula.image.src})`
          } as CSSProperties
        }
      />
    ))}
  </div>
)
