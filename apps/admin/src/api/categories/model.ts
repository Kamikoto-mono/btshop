import type { IAdminCategoryDto, IAdminSubCategoryDto } from './types'

export interface IAdminSubCategoryNode {
  categoryId: string
  childSubCategories: IAdminSubCategoryNode[]
  desc: string
  id: string
  name: string
  parentSubCategoryId: string | null
  productsInStockCount: number
}

export interface IAdminCategoryNode {
  desc: string
  id: string
  name: string
  productsInStockCount: number
  subCategories: IAdminSubCategoryNode[]
}

export interface ICategoryColumnItem {
  id: string
  name: string
  productsInStockCount: number
}

export const mapSubCategoryNode = (
  dto: IAdminSubCategoryDto
): IAdminSubCategoryNode => ({
  categoryId: dto.categoryId,
  childSubCategories: dto.childSubCategories.map(mapSubCategoryNode),
  desc: dto.desc,
  id: dto.id,
  name: dto.name,
  parentSubCategoryId: dto.subCategoryId,
  productsInStockCount: dto.productsInStockCount
})

export const mapCategoryNode = (dto: IAdminCategoryDto): IAdminCategoryNode => ({
  desc: dto.desc,
  id: dto.id,
  name: dto.name,
  productsInStockCount: dto.productsInStockCount,
  subCategories: dto.subCategories.map(mapSubCategoryNode)
})

export const mapCategoryTree = (items: IAdminCategoryDto[]) =>
  items.map(mapCategoryNode)
