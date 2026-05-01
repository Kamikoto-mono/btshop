import type { ICategoryNode, ISubCategoryNode } from '@/api/categories/model'

const findSubCategoryRecursive = (
  subCategories: ISubCategoryNode[],
  subCategoryId?: string
): ISubCategoryNode | null => {
  if (!subCategoryId) {
    return null
  }

  for (const subCategory of subCategories) {
    if (subCategory.id === subCategoryId) {
      return subCategory
    }

    const childMatch = findSubCategoryRecursive(
      subCategory.childSubCategories,
      subCategoryId
    )

    if (childMatch) {
      return childMatch
    }
  }

  return null
}

export const findCategoryContext = (
  categories: ICategoryNode[],
  params: {
    categoryId?: string
    subCategoryId?: string
  }
) => {
  const category =
    categories.find((item) => item.id === params.categoryId) ??
    categories.find((item) => findSubCategoryRecursive(item.subCategories, params.subCategoryId))

  const subCategory = category
    ? findSubCategoryRecursive(category.subCategories, params.subCategoryId)
    : null

  return {
    category: category ?? null,
    subCategory
  }
}
