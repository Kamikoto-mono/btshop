import type { IProduct } from '@/api/products/model'

export const PROFILE_STORAGE_KEY = 'btshop-profile'
export const ORDER_STORAGE_KEY = 'btshop-orders'

export interface ICartLikeItem {
  product: IProduct
  quantity: number
}

export interface IStoredOrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface IStoredOrder {
  address?: string
  createdAt: string
  customer: string
  delivery?: string
  deliveryPrice?: number
  email?: string
  id: string
  items: IStoredOrderItem[]
  phone?: string
  postalCode?: string
  promoCode?: string | null
  status: string
  telegram?: string
  totalPrice?: number
}

export interface IStoredProfile {
  address?: string
  email?: string
  fullName?: string
  phone?: string
  postalCode?: string
  telegram?: string
}

const fallbackProducts: IProduct[] = [
  {
    brand: 'ZPHC',
    categoryId: 'mock-category-injection',
    categoryName: 'Инъекции',
    description: 'Классический длинный эфир для базовых курсов и TRT-схем.',
    f_price: null,
    id: 'mock-te-250',
    inStock: 100,
    name: 'Testosterone Enanthate 250',
    photo: null,
    photos: [],
    price: 2800,
    subCategoryId: 'mock-subcategory-testosterone',
    subCategoryName: 'Тестостерон'
  },
  {
    brand: 'Balkan',
    categoryId: 'mock-category-injection',
    categoryName: 'Инъекции',
    description: 'Более концентрированная версия энантата под опытные схемы.',
    f_price: null,
    id: 'mock-te-300',
    inStock: 100,
    name: 'Testosterone Enanthate 300',
    photo: null,
    photos: [],
    price: 3150,
    subCategoryId: 'mock-subcategory-testosterone',
    subCategoryName: 'Тестостерон'
  },
  {
    brand: 'SP',
    categoryId: 'mock-category-injection',
    categoryName: 'Инъекции',
    description: 'Короткий эфир с быстрым стартом и гибкой настройкой схемы.',
    f_price: null,
    id: 'mock-tp-100',
    inStock: 100,
    name: 'Testosterone Propionate 100',
    photo: null,
    photos: [],
    price: 2550,
    subCategoryId: 'mock-subcategory-testosterone',
    subCategoryName: 'Тестостерон'
  }
]

const toOrderItem = (product: IProduct, quantity: number): IStoredOrderItem => ({
  id: product.id,
  name: product.name,
  price: product.price,
  quantity
})

export const mockProfile: IStoredProfile = {
  address: 'Москва, улица Примерная, дом 10, квартира 24',
  email: 'battletoads@example.com',
  fullName: 'Иванов Иван Иванович',
  phone: '+7 999 123-45-67',
  postalCode: '101000',
  telegram: '@battletoads_client'
}

const defaultOrderProducts = {
  first: fallbackProducts[0],
  second: fallbackProducts[1] ?? fallbackProducts[0],
  third: fallbackProducts[2] ?? fallbackProducts[0]
}

export const mockOrderHistory: IStoredOrder[] = [
  {
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    customer: mockProfile.fullName ?? '',
    delivery: 'Почта — первый класс',
    deliveryPrice: 1000,
    email: mockProfile.email,
    id: 'mock-001',
    items: [
      toOrderItem(defaultOrderProducts.first, 2),
      toOrderItem(defaultOrderProducts.third, 1)
    ],
    phone: mockProfile.phone,
    postalCode: mockProfile.postalCode,
    status: 'Доставлен',
    telegram: mockProfile.telegram,
    totalPrice:
      defaultOrderProducts.first.price * 2 +
      defaultOrderProducts.third.price +
      1000
  },
  {
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    customer: mockProfile.fullName ?? '',
    delivery: 'EMS курьерская',
    deliveryPrice: 1500,
    email: mockProfile.email,
    id: 'mock-002',
    items: [
      toOrderItem(defaultOrderProducts.second, 1),
      toOrderItem(defaultOrderProducts.first, 1)
    ],
    phone: mockProfile.phone,
    postalCode: mockProfile.postalCode,
    status: 'Новый',
    telegram: mockProfile.telegram,
    totalPrice:
      defaultOrderProducts.second.price +
      defaultOrderProducts.first.price +
      1500
  }
]

export const mapCartItemsToOrderItems = (items: ICartLikeItem[]): IStoredOrderItem[] =>
  items.map((item) => toOrderItem(item.product, item.quantity))

export const createMockOrder = ({
  address,
  customer,
  delivery,
  deliveryPrice,
  email,
  items,
  phone,
  postalCode,
  promoCode,
  status,
  telegram
}: {
  address?: string
  customer: string
  delivery?: string
  deliveryPrice?: number
  email?: string
  items: ICartLikeItem[]
  phone?: string
  postalCode?: string
  promoCode?: string | null
  status: string
  telegram?: string
}): IStoredOrder => {
  const orderItems = mapCartItemsToOrderItems(items)
  const productsTotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return {
    address,
    createdAt: new Date().toISOString(),
    customer,
    delivery,
    deliveryPrice,
    email,
    id: `order-${Date.now()}`,
    items: orderItems,
    phone,
    postalCode,
    promoCode: promoCode ?? null,
    status,
    telegram,
    totalPrice: productsTotal + (deliveryPrice ?? 0)
  }
}
