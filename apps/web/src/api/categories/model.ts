import type { ICategoryDto, ISubCategoryDto } from './types'

export interface ISubCategoryNode {
  categoryId: string
  childSubCategories: ISubCategoryNode[]
  desc: string
  id: string
  name: string
  parentSubCategoryId: string | null
  productsInStockCount: number
}

export interface ICategoryNode {
  desc: string
  id: string
  name: string
  productsInStockCount: number
  subCategories: ISubCategoryNode[]
}

export interface ICatalogFilterOption {
  id: string
  label: string
}

const mapSubCategoryNode = (dto: ISubCategoryDto): ISubCategoryNode => ({
  categoryId: dto.categoryId,
  childSubCategories: dto.childSubCategories.map(mapSubCategoryNode),
  desc: dto.desc,
  id: dto.id,
  name: dto.name,
  parentSubCategoryId: dto.subCategoryId,
  productsInStockCount: dto.productsInStockCount ?? 0
})

export const mapCategoryNode = (dto: ICategoryDto): ICategoryNode => ({
  desc: dto.desc,
  id: dto.id,
  name: dto.name,
  productsInStockCount: dto.productsInStockCount ?? 0,
  subCategories: dto.subCategories.map(mapSubCategoryNode)
})

export const mapCategoryTree = (items: ICategoryDto[]) => items.map(mapCategoryNode)

export const buildSubCategoryOptions = (
  categories: ICategoryNode[],
  categoryId?: string
) => {
  const category = categories.find((item) => item.id === categoryId)

  if (!category) {
    return []
  }

  const options: ICatalogFilterOption[] = []

  for (const subCategory of category.subCategories) {
    options.push({
      id: subCategory.id,
      label: subCategory.name
    })

    for (const childSubCategory of subCategory.childSubCategories) {
      options.push({
        id: childSubCategory.id,
        label: `${subCategory.name} → ${childSubCategory.name}`
      })
    }
  }

  return options
}
