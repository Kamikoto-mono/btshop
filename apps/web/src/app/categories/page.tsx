import { categoriesApi } from '@/api/categories'
import { CategoriesView } from '@/components/catalog'

export default async function CategoriesPage() {
  const categories = await categoriesApi.getCategories().catch(() => [])

  return <CategoriesView categories={categories} />
}
