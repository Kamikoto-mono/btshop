import { publicApi } from '../config'
import { mapCategoryTree } from './model'
import type { ICategoryDto } from './types'

const getCategories = async () => {
  const { data } = await publicApi.get<ICategoryDto[]>('/categories')
  return mapCategoryTree(data)
}

export const categoriesApi = {
  getCategories
}
