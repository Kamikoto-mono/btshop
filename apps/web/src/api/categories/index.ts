import { unstable_cache } from 'next/cache'

import { publicApi } from '../config'
import { mapCategoryTree } from './model'
import type { ICategoryDto } from './types'

const getCategories = unstable_cache(async () => {
  const { data } = await publicApi.get<ICategoryDto[]>('/categories')
  return mapCategoryTree(data)
}, ['web-categories-tree'], {
  revalidate: 60 * 20
})

export const categoriesApi = {
  getCategories
}
