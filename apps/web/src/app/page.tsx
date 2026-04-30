import { productsApi } from '@/api/products'
import { HomePage } from '@/components/home'

export default async function Page() {
  const items = await productsApi.getRandomProducts({
    limit: 15
  })

  return <HomePage popularProducts={items} />
}
