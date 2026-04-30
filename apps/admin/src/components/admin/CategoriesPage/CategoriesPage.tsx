'use client'

import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode
} from 'react'
import { Button, Card, Empty, Input, Spin, Typography, message } from 'antd'
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'

import { categoriesApi } from '@/api/categories'
import type {
  IAdminCategoryNode,
  IAdminSubCategoryNode
} from '@/api/categories/model'
import styles from './CategoriesPage.module.scss'

type ColumnLevel = 'category' | 'subCategory' | 'childSubCategory'
type EditField = 'desc' | 'name'

interface IEditingState {
  descSnapshot: string
  field: EditField
  id: string
  level: ColumnLevel
  nameSnapshot: string
  value: string
}

interface ICreatingState {
  desc: string
  level: ColumnLevel
  name: string
}

interface IDeleteState {
  id: string
  level: ColumnLevel
}

type TCategoryItem = IAdminCategoryNode | IAdminSubCategoryNode

const getSubCategoryChildren = (subCategory: IAdminSubCategoryNode | null) =>
  subCategory?.childSubCategories ?? []

export const CategoriesPage = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<IAdminCategoryNode[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(
    null
  )
  const [selectedChildSubCategoryId, setSelectedChildSubCategoryId] = useState<
    string | null
  >(null)
  const [editing, setEditing] = useState<IEditingState | null>(null)
  const [creating, setCreating] = useState<ICreatingState | null>(null)
  const [deleting, setDeleting] = useState<IDeleteState | null>(null)

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  )

  const subCategories = selectedCategory?.subCategories ?? []

  const selectedSubCategory = useMemo(
    () => subCategories.find((item) => item.id === selectedSubCategoryId) ?? null,
    [selectedSubCategoryId, subCategories]
  )

  const childSubCategories = getSubCategoryChildren(selectedSubCategory)

  const syncSelection = (
    nextCategories: IAdminCategoryNode[],
    preferredCategoryId?: string | null,
    preferredSubCategoryId?: string | null,
    preferredChildSubCategoryId?: string | null
  ) => {
    const nextCategory =
      nextCategories.find((item) => item.id === preferredCategoryId) ??
      nextCategories[0] ??
      null

    const nextSubCategory =
      nextCategory?.subCategories.find((item) => item.id === preferredSubCategoryId) ??
      nextCategory?.subCategories[0] ??
      null

    const nextChildSubCategory =
      nextSubCategory?.childSubCategories.find(
        (item) => item.id === preferredChildSubCategoryId
      ) ??
      nextSubCategory?.childSubCategories[0] ??
      null

    setSelectedCategoryId(nextCategory?.id ?? null)
    setSelectedSubCategoryId(nextSubCategory?.id ?? null)
    setSelectedChildSubCategoryId(nextChildSubCategory?.id ?? null)
  }

  const loadCategories = async (preferred?: {
    categoryId?: string | null
    childSubCategoryId?: string | null
    subCategoryId?: string | null
  }) => {
    setIsLoading(true)

    try {
      const nextCategories = await categoriesApi.getCategories()
      setCategories(nextCategories)
      syncSelection(
        nextCategories,
        preferred?.categoryId ?? selectedCategoryId,
        preferred?.subCategoryId ?? selectedSubCategoryId,
        preferred?.childSubCategoryId ?? selectedChildSubCategoryId
      )
    } catch {
      messageApi.error('Не удалось загрузить категории.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const resetInlineStates = () => {
    setEditing(null)
    setCreating(null)
    setDeleting(null)
  }

  const handleSelectCategory = (categoryId: string) => {
    resetInlineStates()
    const nextCategory = categories.find((item) => item.id === categoryId) ?? null
    const nextSubCategory = nextCategory?.subCategories[0] ?? null
    const nextChildSubCategory = nextSubCategory?.childSubCategories[0] ?? null

    setSelectedCategoryId(categoryId)
    setSelectedSubCategoryId(nextSubCategory?.id ?? null)
    setSelectedChildSubCategoryId(nextChildSubCategory?.id ?? null)
  }

  const handleSelectSubCategory = (subCategoryId: string) => {
    resetInlineStates()
    const nextSubCategory =
      subCategories.find((item) => item.id === subCategoryId) ?? null
    const nextChildSubCategory = nextSubCategory?.childSubCategories[0] ?? null

    setSelectedSubCategoryId(subCategoryId)
    setSelectedChildSubCategoryId(nextChildSubCategory?.id ?? null)
  }

  const handleSelectChildSubCategory = (childSubCategoryId: string) => {
    resetInlineStates()
    setSelectedChildSubCategoryId(childSubCategoryId)
  }

  const handleOpenCreate = (level: ColumnLevel) => {
    setEditing(null)
    setDeleting(null)
    setCreating({
      desc: '',
      level,
      name: ''
    })
  }

  const handleCreate = async () => {
    if (!creating) {
      return
    }

    const name = creating.name.trim()
    const desc = creating.desc.trim()

    if (!name) {
      return
    }

    setIsSubmitting(true)

    try {
      if (creating.level === 'category') {
        const created = await categoriesApi.createCategory({ desc, name })
        await loadCategories({ categoryId: created.id })
      }

      if (creating.level === 'subCategory' && selectedCategoryId) {
        const created = await categoriesApi.createSubCategory({
          categoryId: selectedCategoryId,
          desc,
          name
        })

        await loadCategories({
          categoryId: selectedCategoryId,
          subCategoryId: created.id
        })
      }

      if (
        creating.level === 'childSubCategory' &&
        selectedCategoryId &&
        selectedSubCategoryId
      ) {
        const created = await categoriesApi.createSubCategory({
          categoryId: selectedCategoryId,
          desc,
          name,
          subCategoryId: selectedSubCategoryId
        })

        await loadCategories({
          categoryId: selectedCategoryId,
          childSubCategoryId: created.id,
          subCategoryId: selectedSubCategoryId
        })
      }

      setCreating(null)
      messageApi.success('Элемент создан.')
    } catch {
      messageApi.error('Не удалось создать элемент.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenEdit = (
    level: ColumnLevel,
    item: TCategoryItem,
    field: EditField
  ) => {
    setCreating(null)
    setDeleting(null)
    setEditing({
      descSnapshot: item.desc,
      field,
      id: item.id,
      level,
      nameSnapshot: item.name,
      value: field === 'desc' ? item.desc : item.name
    })
  }

  const handleSaveEdit = async () => {
    if (!editing) {
      return
    }

    const nextValue = editing.value.trim()
    const nextName = editing.field === 'name' ? nextValue : editing.nameSnapshot
    const nextDesc = editing.field === 'desc' ? nextValue : editing.descSnapshot

    if (!nextName) {
      return
    }

    setIsSubmitting(true)

    try {
      if (editing.level === 'category') {
        await categoriesApi.updateCategory(editing.id, {
          desc: nextDesc,
          name: nextName
        })
        await loadCategories({ categoryId: editing.id })
      } else if (selectedCategoryId) {
        await categoriesApi.updateSubCategory(editing.id, {
          desc: nextDesc,
          name: nextName
        })
        await loadCategories({
          categoryId: selectedCategoryId,
          childSubCategoryId:
            editing.level === 'childSubCategory'
              ? editing.id
              : selectedChildSubCategoryId,
          subCategoryId:
            editing.level === 'subCategory' ? editing.id : selectedSubCategoryId
        })
      }

      setEditing(null)
      messageApi.success('Изменения сохранены.')
    } catch {
      messageApi.error('Не удалось сохранить изменения.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (level: ColumnLevel, id: string) => {
    setIsSubmitting(true)

    try {
      if (level === 'category') {
        await categoriesApi.deleteCategory(id)
        await loadCategories()
      } else {
        await categoriesApi.deleteSubCategory(id)
        await loadCategories({
          categoryId: selectedCategoryId,
          subCategoryId: level === 'subCategory' ? null : selectedSubCategoryId
        })
      }

      messageApi.success('Элемент удалён.')
      setDeleting(null)
    } catch {
      messageApi.error('Не удалось удалить элемент.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderInlineCreate = (level: ColumnLevel) => {
    if (creating?.level !== level) {
      return null
    }

    return (
      <div className={styles.inlineCreate}>
        <Input
          autoFocus
          onChange={(event) =>
            setCreating((current) =>
              current ? { ...current, name: event.target.value } : current
            )
          }
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setCreating(null)
            }
          }}
          placeholder='Название'
          value={creating.name}
        />
        <Input.TextArea
          autoSize={{ maxRows: 4, minRows: 3 }}
          onChange={(event) =>
            setCreating((current) =>
              current ? { ...current, desc: event.target.value } : current
            )
          }
          placeholder='Описание'
          value={creating.desc}
        />
        <div className={styles.inlineCreateActions}>
          <Button
            icon={<CheckOutlined />}
            loading={isSubmitting}
            onClick={() => void handleCreate()}
            type='primary'
          />
          <Button icon={<CloseOutlined />} onClick={() => setCreating(null)} />
        </div>
      </div>
    )
  }

  const renderItemActions = (level: ColumnLevel, item: TCategoryItem) => {
    const isEditingName =
      editing?.id === item.id && editing.level === level && editing.field === 'name'
    const isEditingDesc =
      editing?.id === item.id && editing.level === level && editing.field === 'desc'
    const isDeleting = deleting?.id === item.id && deleting.level === level

    if (isEditingName || isEditingDesc || isDeleting) {
      return null
    }

    return (
      <div className={styles.itemActions}>
        <TooltipButton
          icon={<EditOutlined />}
          onClick={(event) => {
            event.stopPropagation()
            handleOpenEdit(level, item, 'name')
          }}
          title='Редактировать название'
        />
        <TooltipButton
          className={item.desc ? styles.descButtonActive : styles.descButtonIdle}
          icon={<UnorderedListOutlined />}
          onClick={(event) => {
            event.stopPropagation()
            handleOpenEdit(level, item, 'desc')
          }}
          title='Редактировать описание'
        />
        <TooltipButton
          icon={<DeleteOutlined />}
          onClick={(event) => {
            event.stopPropagation()
            setCreating(null)
            setEditing(null)
            setDeleting({ id: item.id, level })
          }}
          title='Удалить'
        />
      </div>
    )
  }

  const renderEditableItem = (
    level: ColumnLevel,
    item: TCategoryItem,
    isActive: boolean,
    onSelect: () => void
  ) => {
    const isEditingName =
      editing?.id === item.id && editing.level === level && editing.field === 'name'
    const isEditingDesc =
      editing?.id === item.id && editing.level === level && editing.field === 'desc'
    const isDeleting = deleting?.id === item.id && deleting.level === level
    const stateClassName =
      isEditingName || isEditingDesc || isDeleting
        ? styles.itemInlineState
        : isActive
          ? styles.itemActive
          : styles.item

    return (
      <div className={styles.itemWrap}>
        <div
          className={stateClassName}
          onClick={() => {
            if (!isEditingName && !isEditingDesc && !isDeleting) {
              onSelect()
            }
          }}
        >
          {isEditingName ? (
            <div className={styles.inlineEdit}>
              <Input
                autoFocus
                onChange={(event) =>
                  setEditing((current) =>
                    current ? { ...current, value: event.target.value } : current
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleSaveEdit()
                  }

                  if (event.key === 'Escape') {
                    setEditing(null)
                  }
                }}
                value={editing.value}
              />
              <Button
                icon={<CheckOutlined />}
                loading={isSubmitting}
                onClick={(event) => {
                  event.stopPropagation()
                  void handleSaveEdit()
                }}
                type='primary'
              />
              <Button
                icon={<CloseOutlined />}
                onClick={(event) => {
                  event.stopPropagation()
                  setEditing(null)
                }}
              />
            </div>
          ) : isDeleting ? (
            <>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
                <span className={styles.itemMeta}>Подтвердите удаление</span>
              </div>
              <div className={styles.itemActions}>
                <Button
                  icon={<CheckOutlined />}
                  loading={isSubmitting}
                  onClick={(event) => {
                    event.stopPropagation()
                    void handleDelete(level, item.id)
                  }}
                  size='small'
                  type='primary'
                />
                <Button
                  icon={<CloseOutlined />}
                  onClick={(event) => {
                    event.stopPropagation()
                    setDeleting(null)
                  }}
                  size='small'
                />
              </div>
            </>
          ) : (
            <>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{item.name}</span>
              </div>
              {renderItemActions(level, item)}
            </>
          )}
        </div>

        {isEditingDesc ? (
          <div className={styles.descEditor}>
            <Input.TextArea
              autoFocus
              autoSize={{ maxRows: 6, minRows: 4 }}
              onChange={(event) =>
                setEditing((current) =>
                  current ? { ...current, value: event.target.value } : current
                )
              }
              placeholder='Описание'
              value={editing.value}
            />
            <div className={styles.descEditorActions}>
              <Button
                icon={<CheckOutlined />}
                loading={isSubmitting}
                onClick={() => void handleSaveEdit()}
                type='primary'
              >
                Сохранить
              </Button>
              <Button onClick={() => setEditing(null)}>Отмена</Button>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <section className={styles.page}>
      {contextHolder}
      <Typography.Title className={styles.heading} level={1}>
        Категории
      </Typography.Title>

      <Spin spinning={isLoading}>
        <div className={styles.columns}>
          <Card
            className={styles.columnCard}
            extra={
              <Button
                icon={<PlusOutlined />}
                onClick={() => handleOpenCreate('category')}
                type='primary'
              />
            }
            title='Категории'
          >
            <div className={styles.columnBody}>
              {renderInlineCreate('category')}

              <div className={styles.list}>
                {categories.map((item) => (
                  <div key={item.id}>
                    {renderEditableItem(
                      'category',
                      item,
                      item.id === selectedCategoryId,
                      () => handleSelectCategory(item.id)
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card
            className={styles.columnCard}
            extra={
              <Button
                disabled={!selectedCategoryId}
                icon={<PlusOutlined />}
                onClick={() => handleOpenCreate('subCategory')}
                type='primary'
              />
            }
            title='Подкатегории'
          >
            <div className={styles.columnBody}>
              {renderInlineCreate('subCategory')}

              {selectedCategory ? (
                <div className={styles.list}>
                  {subCategories.length > 0 ? (
                    subCategories.map((item) => (
                      <div key={item.id}>
                        {renderEditableItem(
                          'subCategory',
                          item,
                          item.id === selectedSubCategoryId,
                          () => handleSelectSubCategory(item.id)
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyWrap}>
                      <Empty description='У выбранной категории пока нет подкатегорий' />
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyWrap}>
                  <Empty description='Сначала выберите категорию слева' />
                </div>
              )}
            </div>
          </Card>

          <Card
            className={styles.columnCard}
            extra={
              <Button
                disabled={!selectedSubCategoryId}
                icon={<PlusOutlined />}
                onClick={() => handleOpenCreate('childSubCategory')}
                type='primary'
              />
            }
            title='Подподкатегории'
          >
            <div className={styles.columnBody}>
              {renderInlineCreate('childSubCategory')}

              {selectedSubCategory ? (
                <div className={styles.list}>
                  {childSubCategories.length > 0 ? (
                    childSubCategories.map((item) => (
                      <div key={item.id}>
                        {renderEditableItem(
                          'childSubCategory',
                          item,
                          item.id === selectedChildSubCategoryId,
                          () => handleSelectChildSubCategory(item.id)
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={styles.emptyWrap}>
                      <Empty description='У выбранной подкатегории пока нет дочерних элементов' />
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyWrap}>
                  <Empty description='Сначала выберите подкатегорию в средней колонке' />
                </div>
              )}
            </div>
          </Card>
        </div>
      </Spin>
    </section>
  )
}

const TooltipButton = ({
  className,
  icon,
  onClick,
  title
}: {
  className?: string
  icon: ReactNode
  onClick: (event: MouseEvent<HTMLElement>) => void
  title: string
}) => (
  <Button
    className={className}
    icon={icon}
    onClick={onClick}
    size='small'
    title={title}
    type='text'
  />
)
