import Link from 'next/link'

import type { ICategoryNode } from '@/api/categories/model'
import { Breadcrumbs, Eyebrow } from '@/components/ui'
import { getMarketHref } from '@/lib/routes'
import styles from './CategoriesView.module.scss'

export const CategoriesView = ({
  categories
}: {
  categories: ICategoryNode[]
}) => {

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
            <section className={styles.category} key={category.id}>
              <h2>{category.name}</h2>

              <div className={styles.compoundList}>
                {category.subCategories.map((subCategory) => (
                  <div className={styles.compound} key={subCategory.id}>
                    <Link
                      className={styles.compoundLink}
                      href={getMarketHref({
                        categoryId: category.id,
                        subCategoryId: subCategory.id
                      })}
                    >
                      {subCategory.name}
                    </Link>

                    {subCategory.childSubCategories.length > 0 ? (
                      <div className={styles.lineList}>
                        {subCategory.childSubCategories.map((childSubCategory) => (
                          <Link
                            className={styles.lineLink}
                            href={getMarketHref({
                              categoryId: category.id,
                              subCategoryId: childSubCategory.id
                            })}
                            key={childSubCategory.id}
                          >
                            <span>{childSubCategory.name}</span>
                            <small>{childSubCategory.productsInStockCount}</small>
                          </Link>
                        ))}
                      </div>
                    ) : null}
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
