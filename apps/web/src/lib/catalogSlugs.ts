import type { ICategoryNode, ISubCategoryNode } from '@/api/categories/model'

export const buildCategoryPath = (params: {
  category: ICategoryNode
  line?: ISubCategoryNode | null
  subCategory?: ISubCategoryNode | null
}) => {
  if (!params.subCategory) {
    return `/${params.category.id}`
  }

  if (!params.line) {
    return `/${params.category.id}/${params.subCategory.id}`
  }

  return `/${params.category.id}/${params.subCategory.id}/${params.line.id}`
}

export const resolveCatalogPathByIds = (
  categories: ICategoryNode[],
  params: {
    categoryId?: string
    subCategoryId?: string
  }
) => {
  if (!params.categoryId && !params.subCategoryId) {
    return '/market'
  }

  const category =
    categories.find((item) => item.id === params.categoryId) ??
    categories.find((item) =>
      item.subCategories.some(
        (subCategory) =>
          subCategory.id === params.subCategoryId ||
          subCategory.childSubCategories.some(
            (childSubCategory) => childSubCategory.id === params.subCategoryId
          )
      )
    )

  if (!category) {
    return '/market'
  }

  if (!params.subCategoryId) {
    return buildCategoryPath({ category })
  }

  for (const subCategory of category.subCategories) {
    if (subCategory.id === params.subCategoryId) {
      return buildCategoryPath({
        category,
        subCategory
      })
    }

    const line = subCategory.childSubCategories.find(
      (childSubCategory) => childSubCategory.id === params.subCategoryId
    )

    if (line) {
      return buildCategoryPath({
        category,
        line,
        subCategory
      })
    }
  }

  return buildCategoryPath({ category })
}

export const findCategoryNodesBySlugs = (
  categories: ICategoryNode[],
  params: {
    categorySlug: string
    compoundSlug?: string
    lineSlug?: string
  }
) => {
  const category =
    categories.find((item) => item.id === params.categorySlug) ?? null

  if (!category) {
    return {
      category: null,
      line: null,
      subCategory: null
    }
  }

  if (!params.compoundSlug) {
    return {
      category,
      line: null,
      subCategory: null
    }
  }

  const subCategory =
    category.subCategories.find((item) => item.id === params.compoundSlug) ?? null

  if (!subCategory) {
    return {
      category: null,
      line: null,
      subCategory: null
    }
  }

  if (!params.lineSlug) {
    return {
      category,
      line: null,
      subCategory
    }
  }

  const line =
    subCategory.childSubCategories.find((item) => item.id === params.lineSlug) ?? null

  if (!line) {
    return {
      category: null,
      line: null,
      subCategory: null
    }
  }

  return {
    category,
    line,
    subCategory
  }
}
