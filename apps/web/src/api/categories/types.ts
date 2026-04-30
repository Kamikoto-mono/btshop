export interface ISubCategoryDto {
  categoryId: string
  childSubCategories: ISubCategoryDto[]
  desc: string
  id: string
  name: string
  productsInStockCount?: number
  subCategoryId: string | null
}

export interface ICategoryDto {
  desc: string
  id: string
  name: string
  productsInStockCount?: number
  subCategories: ISubCategoryDto[]
}
