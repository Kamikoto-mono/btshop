import { publicApi } from '../config'
import { mapProduct } from './model'
import type {
  IProductDto,
  IProductsListDto,
  IProductsQuery,
  IRandomProductsQuery
} from './types'

const getProducts = async (params?: IProductsQuery) => {
  const { data } = await publicApi.get<IProductsListDto>('/products', {
    params: {
      categoryId: params?.categoryId,
      limit: params?.limit ?? 12,
      maxPrice: params?.maxPrice,
      minPrice: params?.minPrice,
      page: params?.page ?? 1,
      sort: params?.sort,
      subCategoryId: params?.subCategoryId
    }
  })

  return {
    items: data.items.map(mapProduct),
    meta: data.meta
  }
}

const getProductById = async (id: string) => {
  const { data } = await publicApi.get<IProductDto>(`/products/${id}`)
  return mapProduct(data)
}

const getRandomProducts = async (params?: IRandomProductsQuery) => {
  const { data } = await publicApi.get<IProductDto[]>('/products/random', {
    params: {
      limit: params?.limit ?? 15
    }
  })

  return data.map(mapProduct)
}

export const productsApi = {
  getProductById,
  getProducts,
  getRandomProducts
}
