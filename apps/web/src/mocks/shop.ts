import { getProducts, type IProduct } from '@btshop/shared'

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
  city?: string
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
  city?: string
  email?: string
  fullName?: string
  phone?: string
  postalCode?: string
  telegram?: string
}

const products = getProducts()

const getProductById = (id: string) => products.find((product) => product.id === id)

const toOrderItem = (product: IProduct, quantity: number): IStoredOrderItem => ({
  id: product.id,
  name: product.name,
  price: product.price,
  quantity
})

export const mockPopularProducts: IProduct[] = (() => {
  if (products.length >= 10) {
    return products.slice(0, 10)
  }

  const fillers = products
    .slice(0, Math.max(10 - products.length, 0))
    .map((product, index) => ({
      ...product,
      id: `${product.id}-popular-${index + 1}`,
      price: product.price + (index + 1) * 150
    }))

  return [...products, ...fillers].slice(0, 10)
})()

export const mockProfile: IStoredProfile = {
  address: 'Москва, улица Примерная, дом 10, квартира 24',
  city: 'Москва',
  email: 'battletoads@example.com',
  fullName: 'Иванов Иван Иванович',
  phone: '+7 999 123-45-67',
  postalCode: '101000',
  telegram: '@battletoads_client'
}

const defaultOrderProducts = {
  first: getProductById('te-001') ?? products[0],
  second: getProductById('te-002') ?? products[1] ?? products[0],
  third: getProductById('tp-001') ?? products[2] ?? products[0]
}

export const mockOrderHistory: IStoredOrder[] = [
  {
    city: mockProfile.city,
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
    city: mockProfile.city,
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
  city,
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
  city?: string
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
    city,
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
