export interface IAdminSubCategoryDto {
  categoryId: string
  childSubCategories: IAdminSubCategoryDto[]
  desc: string
  id: string
  name: string
  productsInStockCount: number
  subCategoryId: string | null
}

export interface IAdminCategoryDto {
  desc: string
  id: string
  name: string
  productsInStockCount: number
  subCategories: IAdminSubCategoryDto[]
}

export interface ICreateCategoryDto {
  desc: string
  name: string
}

export interface ICreateSubCategoryDto {
  categoryId: string
  desc: string
  name: string
  subCategoryId?: string | null
}

export interface IUpdateCategoryDto {
  desc: string
  name: string
}

export interface IUpdateSubCategoryDto {
  categoryId?: string
  desc: string
  name: string
  subCategoryId?: string | null
}
