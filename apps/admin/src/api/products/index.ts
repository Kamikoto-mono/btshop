import { adminApi } from '../config'
import { mapProduct } from './model'
import type {
  IAdminProductDto,
  IAdminProductsListDto,
  IAdminProductsListResponse,
  IAdminProductsQuery,
  ICreateProductDto,
  IDeleteProductResponseDto,
  IUpdateProductDto
} from './types'

const appendBaseProductFields = (
  formData: FormData,
  payload: {
    categoryId?: string
    c_price: number
    desc: string
    f_price?: number
    inStock: number
    name: string
    price: number
    subCategoryId?: string
  }
) => {
  formData.append('name', payload.name)
  formData.append('desc', payload.desc)
  formData.append('price', String(payload.price))
  formData.append('c_price', String(payload.c_price))
  if (typeof payload.f_price === 'number') {
    formData.append('f_price', String(payload.f_price))
  }
  formData.append('inStock', String(payload.inStock))

  if (payload.categoryId) {
    formData.append('categoryId', payload.categoryId)
  }

  if (payload.subCategoryId) {
    formData.append('subCategoryId', payload.subCategoryId)
  }
}

const getProducts = async (params?: IAdminProductsQuery) => {
  const { data } = await adminApi.get<IAdminProductsListDto>('/admin/products', {
    params: {
      categoryId: params?.categoryId,
      limit: params?.limit ?? 30,
      maxPrice: params?.maxPrice,
      minPrice: params?.minPrice,
      page: params?.page ?? 1,
      sort: params?.sort,
      subCategoryId: params?.subCategoryId
    }
  })

  const response: IAdminProductsListResponse = {
    items: data.items,
    meta: data.meta
  }

  return {
    items: response.items.map(mapProduct),
    meta: response.meta
  }
}

const createProduct = async (payload: ICreateProductDto) => {
  const formData = new FormData()

  appendBaseProductFields(formData, payload)
  payload.photos.forEach((photo) => {
    formData.append('photos', photo)
  })

  const { data } = await adminApi.post<IAdminProductDto>('/admin/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return mapProduct(data)
}

const updateProduct = async (id: string, payload: IUpdateProductDto) => {
  const formData = new FormData()

  appendBaseProductFields(formData, payload)
  if (payload.photos) {
    if (payload.photos.length === 0) {
      formData.append('photos', '[]')
    } else {
      payload.photos.forEach((photoKey) => {
        formData.append('photos', photoKey)
      })
    }
  }
  ;(payload.newPhotos ?? []).forEach((photo) => {
    formData.append('newPhotos', photo)
  })

  const { data } = await adminApi.patch<IAdminProductDto>(
    `/admin/products/${id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )

  return mapProduct(data)
}

const deleteProduct = async (id: string) => {
  const { data } = await adminApi.delete<IDeleteProductResponseDto>(
    `/admin/products/${id}`
  )
  return data
}

export const productsApi = {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct
}
