'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  App,
  Button,
  Empty,
  Input,
  InputNumber,
  Popconfirm,
  Select,
  Space,
  Tag,
  Typography,
  type TablePaginationConfig
} from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

import { categoriesApi } from '@/api/categories'
import type { IAdminCategoryNode } from '@/api/categories/model'
import { productsApi } from '@/api/products'
import type { IAdminProduct } from '@/api/products/model'
import {
  AdminDataTable,
  AdminFilterField,
  AdminFiltersPanel
} from '@/components/ui'
import { ProductUpsertModal } from './ProductUpsertModal'
import styles from './ProductsPage.module.scss'

interface IQuickEditState {
  field: 'c_price' | 'f_price' | 'inStock' | 'name' | 'price'
  productId: string
  value: number | string | null
}

interface IProductFilters {
  categoryId?: string
  childSubCategoryId?: string
  maxPrice?: number | null
  minPrice?: number | null
  sort?: 'priceAsc' | 'priceDesc'
  subCategoryId?: string
}

export const ProductsPage = () => {
  const PAGE_SIZE = 30
  const { message } = App.useApp()
  const [categories, setCategories] = useState<IAdminCategoryNode[]>([])
  const [filters, setFilters] = useState<IProductFilters>({})
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [products, setProducts] = useState<IAdminProduct[]>([])
  const [editingProduct, setEditingProduct] = useState<IAdminProduct | null>(null)
  const [quickEdit, setQuickEdit] = useState<IQuickEditState | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  const loadCategories = async () => {
    setIsCategoriesLoading(true)

    try {
      const response = await categoriesApi.getCategories()
      setCategories(response)
    } catch {
      message.error('Не удалось загрузить категории.')
    } finally {
      setIsCategoriesLoading(false)
    }
  }

  const loadProducts = async (page = currentPage, nextFilters = filters) => {
    setIsLoading(true)

    try {
      const response = await productsApi.getProducts({
        categoryId: nextFilters.categoryId,
        limit: PAGE_SIZE,
        maxPrice: nextFilters.maxPrice ?? undefined,
        minPrice: nextFilters.minPrice ?? undefined,
        page,
        sort: nextFilters.sort,
        subCategoryId:
          nextFilters.childSubCategoryId ?? nextFilters.subCategoryId ?? undefined
      })

      setProducts(response.items)
      setCurrentPage(response.meta.page)
      setTotalProducts(response.meta.total)
    } catch {
      message.error('Не удалось загрузить товары.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  useEffect(() => {
    void loadProducts(currentPage, filters)
  }, [currentPage, filters])

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === filters.categoryId) ?? null,
    [categories, filters.categoryId]
  )

  const selectedSubCategory = useMemo(
    () =>
      selectedCategory?.subCategories.find(
        (item) => item.id === filters.subCategoryId
      ) ?? null,
    [filters.subCategoryId, selectedCategory]
  )

  const secondLevelOptions = useMemo(
    () =>
      (selectedCategory?.subCategories ?? []).map((item) => ({
        label: item.name,
        value: item.id
      })),
    [selectedCategory]
  )

  const thirdLevelOptions = useMemo(
    () =>
      (selectedSubCategory?.childSubCategories ?? []).map((item) => ({
        label: item.name,
        value: item.id
      })),
    [selectedSubCategory]
  )

  const applyFilters = (
    updater: (current: IProductFilters) => IProductFilters
  ) => {
    setFilters((current) => updater(current))
    setCurrentPage(1)
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const openEditModal = (product: IAdminProduct) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  const syncQuickEdit = async (
    product: IAdminProduct,
    patch: Partial<
      Pick<IAdminProduct, 'c_price' | 'desc' | 'f_price' | 'inStock' | 'name' | 'price'>
    > & {
      subCategoryId?: string
    }
  ) => {
    try {
      await productsApi.updateProduct(product.id, {
        c_price: patch.c_price ?? product.c_price,
        desc: patch.desc ?? product.desc,
        f_price: patch.f_price ?? product.f_price ?? undefined,
        inStock: patch.inStock ?? product.inStock,
        name: patch.name ?? product.name,
        photos: product.photos,
        price: patch.price ?? product.price,
        subCategoryId: patch.subCategoryId ?? product.subCategoryId
      })

      setQuickEdit(null)
      message.success('Товар обновлён.')
      await loadProducts(currentPage)
    } catch {
      message.error('Не удалось обновить товар.')
    }
  }

  const handleQuickEditSave = async (product: IAdminProduct) => {
    if (!quickEdit || quickEdit.productId !== product.id) {
      return
    }

    if (quickEdit.field === 'name') {
      await syncQuickEdit(product, {
        name: String(quickEdit.value).trim()
      })
      return
    }

    await syncQuickEdit(product, {
      [quickEdit.field]:
        quickEdit.field === 'f_price' && quickEdit.value === null
          ? undefined
          : Number(quickEdit.value)
    } as Partial<IAdminProduct>)
  }

  const renderQuickNumberCell = (
    product: IAdminProduct,
    field: 'c_price' | 'f_price' | 'inStock' | 'price',
    displayValue: number | null | undefined,
    placeholder?: string
  ) => {
    const isEditing =
      quickEdit?.productId === product.id && quickEdit.field === field

    if (isEditing) {
      return (
        <Space.Compact>
          <InputNumber
            className={styles.editableField}
            min={0}
            onChange={(value) =>
              setQuickEdit((current) =>
                current
                  ? {
                      ...current,
                      value: field === 'f_price' ? (value ?? null) : (value ?? 0)
                    }
                  : current
              )
            }
            placeholder={placeholder}
            value={quickEdit.value === null ? null : Number(quickEdit.value)}
          />
          <Button
            icon={<CheckOutlined />}
            onClick={() => void handleQuickEditSave(product)}
            type='primary'
          />
          <Button icon={<CloseOutlined />} onClick={() => setQuickEdit(null)} />
        </Space.Compact>
      )
    }

    return (
      <div className={styles.editableCell}>
        <span>{typeof displayValue === 'number' ? `${displayValue} ₽` : '—'}</span>
        <Button
          icon={<EditOutlined />}
          onClick={() =>
            setQuickEdit({
              field,
              productId: product.id,
              value: displayValue ?? null
            })
          }
          size='small'
          type='text'
        />
      </div>
    )
  }

  const columns = useMemo<ColumnsType<IAdminProduct>>(
    () => [
      {
        dataIndex: 'photo',
        key: 'photo',
        render: (_, product) => (
          <Button
            className={styles.coverButton}
            onClick={() => openEditModal(product)}
            type='text'
          >
            {product.photo ? (
              <img
                alt={product.name}
                className={styles.coverImage}
                src={product.photo}
              />
            ) : (
              <span className={styles.coverFallback}>Нет фото</span>
            )}
          </Button>
        ),
        title: 'Фото',
        width: 108
      },
      {
        dataIndex: 'name',
        key: 'name',
        render: (_, product) => {
          const isEditing =
            quickEdit?.productId === product.id && quickEdit.field === 'name'

          if (isEditing) {
            return (
              <Space.Compact>
                <Input
                  className={styles.editableField}
                  onChange={(event) =>
                    setQuickEdit((current) =>
                      current ? { ...current, value: event.target.value } : current
                    )
                  }
                  value={String(quickEdit.value)}
                />
                <Button
                  icon={<CheckOutlined />}
                  onClick={() => void handleQuickEditSave(product)}
                  type='primary'
                />
                <Button icon={<CloseOutlined />} onClick={() => setQuickEdit(null)} />
              </Space.Compact>
            )
          }

          return (
            <div className={styles.editableCell}>
              <span className={styles.tableName}>{product.name}</span>
              <Button
                icon={<EditOutlined />}
                onClick={() =>
                  setQuickEdit({
                    field: 'name',
                    productId: product.id,
                    value: product.name
                  })
                }
                size='small'
                type='text'
              />
            </div>
          )
        },
        title: 'Товар',
        width: 420
      },
      {
        dataIndex: 'subCategoryPath',
        key: 'subCategoryPath',
        render: (value) => <Tag>{value}</Tag>,
        title: 'Подкатегория',
        width: 140
      },
      {
        dataIndex: 'price',
        key: 'price',
        render: (_, product) =>
          renderQuickNumberCell(product, 'price', product.price),
        title: 'Цена',
        width: 170
      },
      {
        dataIndex: 'f_price',
        key: 'f_price',
        render: (_, product) =>
          renderQuickNumberCell(product, 'f_price', product.f_price ?? null, 'Нет'),
        title: 'Старая цена',
        width: 170
      },
      {
        dataIndex: 'c_price',
        key: 'c_price',
        render: (_, product) =>
          renderQuickNumberCell(product, 'c_price', product.c_price),
        title: 'Себестоимость',
        width: 180
      },
      {
        dataIndex: 'inStock',
        key: 'inStock',
        render: (_, product) =>
          renderQuickNumberCell(product, 'inStock', product.inStock),
        title: 'Остаток',
        width: 150
      },
      {
        key: 'actions',
        render: (_, product) => (
          <div className={styles.actions}>
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(product)}
              size='small'
              type='text'
            />
            <Popconfirm
              cancelText='Нет'
              okText='Да'
              onConfirm={() =>
                productsApi
                  .deleteProduct(product.id)
                  .then(async () => {
                    message.success('Товар удалён.')
                    await loadProducts(currentPage)
                  })
                  .catch(() => {
                    message.error('Не удалось удалить товар.')
                  })
              }
              title='Удалить товар?'
            >
              <Button icon={<DeleteOutlined />} size='small' type='text' />
            </Popconfirm>
          </div>
        ),
        title: '',
        width: 44
      }
    ],
    [message, quickEdit]
  )

  const handleTableChange = (pagination: TablePaginationConfig) => {
    void loadProducts(pagination.current ?? 1)
  }

  return (
    <section className={styles.page}>
      <div className={styles.headerRow}>
        <Typography.Title className={styles.heading} level={1}>
          Товары
        </Typography.Title>

        <Button icon={<PlusOutlined />} onClick={openCreateModal} type='primary'>
          Создать товар
        </Button>
      </div>

      <AdminFiltersPanel contentClassName={styles.filtersGrid}>
        <AdminFilterField label='Категория'>
          <Select
            allowClear
            disabled={isCategoriesLoading}
            onChange={(value) =>
              applyFilters((current) => ({
                ...current,
                categoryId: value,
                childSubCategoryId: undefined,
                subCategoryId: undefined
              }))
            }
            options={categories.map((item) => ({
              label: item.name,
              value: item.id
            }))}
            placeholder='Все категории'
            value={filters.categoryId}
          />
        </AdminFilterField>

        <AdminFilterField label='Подкатегория'>
          <Select
            allowClear
            disabled={!selectedCategory || isCategoriesLoading}
            onChange={(value) =>
              applyFilters((current) => ({
                ...current,
                childSubCategoryId: undefined,
                subCategoryId: value
              }))
            }
            options={secondLevelOptions}
            placeholder='Все подкатегории'
            value={filters.subCategoryId}
          />
        </AdminFilterField>

        <AdminFilterField label='Подподкатегория'>
          <Select
            allowClear
            disabled={!selectedSubCategory || isCategoriesLoading}
            onChange={(value) =>
              applyFilters((current) => ({
                ...current,
                childSubCategoryId: value
              }))
            }
            options={thirdLevelOptions}
            placeholder='Не выбрана'
            value={filters.childSubCategoryId}
          />
        </AdminFilterField>

        <AdminFilterField className={styles.priceBlock} label='Цена'>
          <div className={styles.priceRange}>
            <InputNumber
              min={0}
              onChange={(value) =>
                applyFilters((current) => ({
                  ...current,
                  minPrice: value ?? null
                }))
              }
              placeholder='От'
              value={filters.minPrice ?? null}
            />
            <span className={styles.rangeDivider}>—</span>
            <InputNumber
              min={0}
              onChange={(value) =>
                applyFilters((current) => ({
                  ...current,
                  maxPrice: value ?? null
                }))
              }
              placeholder='До'
              value={filters.maxPrice ?? null}
            />
          </div>
        </AdminFilterField>

        <AdminFilterField label='Сортировка'>
          <Select
            allowClear
            onChange={(value) =>
              applyFilters((current) => ({
                ...current,
                sort: value
              }))
            }
            options={[
              { label: 'Цена: по возрастанию', value: 'priceAsc' },
              { label: 'Цена: по убыванию', value: 'priceDesc' }
            ]}
            placeholder='Без сортировки'
            value={filters.sort}
          />
        </AdminFilterField>
      </AdminFiltersPanel>

      <AdminDataTable
        columns={columns}
        dataSource={products}
        loading={isLoading}
        locale={{
          emptyText: <Empty description='Товары пока не добавлены' />
        }}
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          showSizeChanger: false,
          total: totalProducts
        }}
        rowKey='id'
        scroll={{ x: 1320 }}
      />

      <ProductUpsertModal
        onClose={closeModal}
        onSaved={() => loadProducts(currentPage)}
        open={isModalOpen}
        product={editingProduct}
      />
    </section>
  )
}
