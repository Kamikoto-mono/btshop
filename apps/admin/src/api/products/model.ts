import type { IAdminCategoryNode, IAdminSubCategoryNode } from '../categories/model'
import type { IAdminProductDto } from './types'

export interface IAdminProduct {
  c_price: number
  categoryId?: string | null
  desc: string
  f_price?: number | null
  id: string
  inStock: number
  name: string
  photo: string | null
  photos: string[]
  price: number
  subCategoryId?: string | null
  subCategoryName?: string | null
  subCategoryPath: string
}

export interface IProductSubCategoryOption {
  categoryId: string
  id: string
  label: string
}

export interface IProductCategorySelectionPath {
  categoryId: string
  childSubCategoryId?: string
  subCategoryId?: string
}

export const mapProduct = (dto: IAdminProductDto): IAdminProduct => ({
  c_price: dto.c_price,
  categoryId: dto.categoryId ?? dto.subCategory?.categoryId ?? null,
  desc: dto.desc,
  f_price: dto.f_price ?? null,
  id: dto.id,
  inStock: dto.inStock,
  name: dto.name,
  photo: dto.photos[0] ?? null,
  photos: dto.photos,
  price: dto.price,
  subCategoryId: dto.subCategoryId ?? dto.subCategory?.id ?? null,
  subCategoryName: dto.subCategory?.name ?? null,
  subCategoryPath:
    dto.subCategory?.name ?? dto.subCategoryId ?? dto.categoryId ?? '—'
})

const walkSubCategories = (
  category: IAdminCategoryNode,
  items: IAdminSubCategoryNode[],
  prefix: string,
  output: IProductSubCategoryOption[]
) => {
  for (const item of items) {
    const nextLabel = `${prefix} / ${item.name}`

    output.push({
      categoryId: category.id,
      id: item.id,
      label: nextLabel
    })

    if (item.childSubCategories.length > 0) {
      walkSubCategories(category, item.childSubCategories, nextLabel, output)
    }
  }
}

export const buildProductSubCategoryOptions = (
  categories: IAdminCategoryNode[]
) => {
  const output: IProductSubCategoryOption[] = []

  for (const category of categories) {
    walkSubCategories(category, category.subCategories, category.name, output)
  }

  return output
}

export const findProductCategorySelectionPath = (
  categories: IAdminCategoryNode[],
  targetSubCategoryId?: string | null,
  targetCategoryId?: string | null
): IProductCategorySelectionPath | null => {
  if (targetSubCategoryId) {
    for (const category of categories) {
      for (const subCategory of category.subCategories) {
        if (subCategory.id === targetSubCategoryId) {
          return {
            categoryId: category.id,
            subCategoryId: subCategory.id
          }
        }

        for (const childSubCategory of subCategory.childSubCategories) {
          if (childSubCategory.id === targetSubCategoryId) {
            return {
              categoryId: category.id,
              childSubCategoryId: childSubCategory.id,
              subCategoryId: subCategory.id
            }
          }
        }
      }
    }
  }

  if (targetCategoryId && categories.some((category) => category.id === targetCategoryId)) {
    return {
      categoryId: targetCategoryId
    }
  }

  return null
}
