import { adminApi } from '../config'
import { mapCategoryNode, mapCategoryTree, mapSubCategoryNode } from './model'
import type {
  IAdminCategoryDto,
  IAdminSubCategoryDto,
  ICreateCategoryDto,
  ICreateSubCategoryDto,
  IUpdateCategoryDto,
  IUpdateSubCategoryDto
} from './types'

const getCategories = async () => {
  const { data } = await adminApi.get<IAdminCategoryDto[]>('/admin/categories')
  return mapCategoryTree(data)
}

const createCategory = async (payload: ICreateCategoryDto) => {
  const { data } = await adminApi.post<IAdminCategoryDto>('/admin/categories', payload)
  return mapCategoryNode(data)
}

const createSubCategory = async (payload: ICreateSubCategoryDto) => {
  const { data } = await adminApi.post<IAdminSubCategoryDto>(
    '/admin/sub-categories',
    payload
  )
  return mapSubCategoryNode(data)
}

const updateCategory = async (id: string, payload: IUpdateCategoryDto) => {
  const { data } = await adminApi.patch<IAdminCategoryDto>(
    `/admin/categories/${id}`,
    payload
  )
  return mapCategoryNode(data)
}

const updateSubCategory = async (
  id: string,
  payload: IUpdateSubCategoryDto
) => {
  const { data } = await adminApi.patch<IAdminSubCategoryDto>(
    `/admin/sub-categories/${id}`,
    payload
  )
  return mapSubCategoryNode(data)
}

const deleteCategory = async (id: string) => {
  await adminApi.delete(`/admin/categories/${id}`)
}

const deleteSubCategory = async (id: string) => {
  await adminApi.delete(`/admin/sub-categories/${id}`)
}

export const categoriesApi = {
  createCategory,
  createSubCategory,
  deleteCategory,
  deleteSubCategory,
  getCategories,
  updateCategory,
  updateSubCategory
}
