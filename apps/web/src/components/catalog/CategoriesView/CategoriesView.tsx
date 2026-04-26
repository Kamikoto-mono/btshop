import Link from 'next/link'

import { getCategories, getLineCount } from '@btshop/shared'

import { Breadcrumbs, Eyebrow } from '@/components/ui'
import { getCompoundHref, getLineHref } from '@/lib/routes'
import styles from './CategoriesView.module.scss'

export const CategoriesView = () => {
  const categories = getCategories()

  return (
    <div className={styles.page}>
      <Breadcrumbs
        items={[
          {
            href: '/',
            label: 'Главная'
          },
          {
            label: 'Категории'
          }
        ]}
      />

      <section className={styles.content}>
        <div className={styles.header}>
          <Eyebrow className={styles.eyebrow}>Каталог</Eyebrow>
        </div>

        <div className={styles.categoryList}>
          {categories.map((category) => (
            <section className={styles.category} key={category.slug}>
              <h2>{category.name}</h2>

              <div className={styles.compoundList}>
                {category.compounds.map((compound) => (
                  <div className={styles.compound} key={compound.slug}>
                    <Link
                      className={styles.compoundLink}
                      href={getCompoundHref(category.slug, compound.slug)}
                    >
                      {compound.name}
                    </Link>

                    <div className={styles.lineList}>
                      {compound.lines.map((line) => (
                        <Link
                          className={styles.lineLink}
                          href={getLineHref(category.slug, compound.slug, line.slug)}
                          key={line.slug}
                        >
                          <span>{line.name}</span>
                          <small>
                            {getLineCount(category.slug, compound.slug, line.slug)}
                          </small>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
