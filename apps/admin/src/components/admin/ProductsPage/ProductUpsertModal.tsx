'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { UploadFile } from 'antd'
import { App, Button, Form, Input, InputNumber, Modal, Select, Space, Spin, Typography } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

import { categoriesApi } from '@/api/categories'
import type { IAdminCategoryNode, IAdminSubCategoryNode } from '@/api/categories/model'
import { productsApi } from '@/api/products'
import { findProductCategorySelectionPath, type IAdminProduct } from '@/api/products/model'
import { UploadDropZone } from '@/components/ui/UploadDropZone/UploadDropZone'
import styles from './ProductUpsertModal.module.scss'

interface IProductFormValues {
  c_price: number
  categoryId: string
  childSubCategoryId?: string
  desc: string
  f_price?: number
  inStock: number
  name: string
  price: number
  subCategoryId: string
}

interface IExistingPhoto {
  key: string
  type: 'existing'
}

interface INewPhoto {
  file: UploadFile
  previewUrl: string
  type: 'new'
}

type TManagedPhoto = IExistingPhoto | INewPhoto

interface IProductUpsertModalProps {
  onClose: () => void
  onSaved: () => Promise<void> | void
  open: boolean
  product: IAdminProduct | null
}

const MAX_PHOTOS = 5
const NON_RENDERABLE_PREVIEW_EXTENSIONS = new Set(['heic', 'heif'])

const getFileExtension = (fileName: string) => {
  const normalized = fileName.trim().toLowerCase()
  const chunks = normalized.split('.')

  return chunks.length > 1 ? chunks[chunks.length - 1] : ''
}

const canRenderImagePreview = (file: File) => {
  const extension = getFileExtension(file.name)

  return !NON_RENDERABLE_PREVIEW_EXTENSIONS.has(extension)
}

const buildInitialManagedPhotos = (product: IAdminProduct | null): TManagedPhoto[] =>
  product?.photos.map((photoKey) => ({ key: photoKey, type: 'existing' })) ?? []

const getManagedPhotoId = (photo: TManagedPhoto) =>
  photo.type === 'existing' ? `existing:${photo.key}` : `new:${photo.file.uid}`

const getManagedPhotoUrl = (photo: TManagedPhoto) =>
  photo.type === 'existing' ? photo.key : photo.previewUrl

const collectNewPhotoFiles = (photos: TManagedPhoto[]) =>
  photos.flatMap((photo) =>
    photo.type === 'new' && photo.file.originFileObj ? [photo.file.originFileObj as File] : []
  )

const getFinalSubCategoryId = (values: IProductFormValues) =>
  values.childSubCategoryId || values.subCategoryId

const buildCategoryOptions = (categories: IAdminCategoryNode[]) =>
  categories.map((category) => ({
    label: category.name,
    value: category.id
  }))

const buildSubCategoryOptions = (subCategories: IAdminSubCategoryNode[]) =>
  subCategories.map((subCategory) => ({
    label: subCategory.name,
    value: subCategory.id
  }))

const findTemplateDesc = (
  categories: IAdminCategoryNode[],
  selectionPath: ReturnType<typeof findProductCategorySelectionPath>
) => {
  if (!selectionPath) {
    return ''
  }

  const category = categories.find((item) => item.id === selectionPath.categoryId)
  const subCategory = category?.subCategories.find((item) => item.id === selectionPath.subCategoryId)
  const childSubCategory = selectionPath.childSubCategoryId
    ? subCategory?.childSubCategories.find((item) => item.id === selectionPath.childSubCategoryId)
    : null

  return childSubCategory?.desc ?? subCategory?.desc ?? category?.desc ?? ''
}

export const ProductUpsertModal = ({
  onClose,
  onSaved,
  open,
  product
}: IProductUpsertModalProps) => {
  const { message } = App.useApp()
  const [form] = Form.useForm<IProductFormValues>()
  const [isSaving, setIsSaving] = useState(false)
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false)
  const [isDescCustomized, setIsDescCustomized] = useState(false)
  const [isDescManuallyCleared, setIsDescManuallyCleared] = useState(false)
  const [modalCategories, setModalCategories] = useState<IAdminCategoryNode[]>([])
  const [managedPhotos, setManagedPhotos] = useState<TManagedPhoto[]>([])
  const previousTemplateDescRef = useRef('')
  const managedPhotosRef = useRef<TManagedPhoto[]>([])

  const selectedCategoryId = Form.useWatch('categoryId', form)
  const selectedSubCategoryId = Form.useWatch('subCategoryId', form)
  const selectedChildSubCategoryId = Form.useWatch('childSubCategoryId', form)

  const selectedCategory = useMemo(
    () => modalCategories.find((category) => category.id === selectedCategoryId) ?? null,
    [modalCategories, selectedCategoryId]
  )

  const selectedSubCategory = useMemo(
    () =>
      selectedCategory?.subCategories.find((subCategory) => subCategory.id === selectedSubCategoryId) ??
      null,
    [selectedCategory, selectedSubCategoryId]
  )

  const selectedChildSubCategory = useMemo(
    () =>
      selectedSubCategory?.childSubCategories.find(
        (childSubCategory) => childSubCategory.id === selectedChildSubCategoryId
      ) ?? null,
    [selectedChildSubCategoryId, selectedSubCategory]
  )

  const currentTemplateDesc = useMemo(
    () =>
      selectedChildSubCategory?.desc ??
      selectedSubCategory?.desc ??
      selectedCategory?.desc ??
      '',
    [selectedCategory, selectedChildSubCategory, selectedSubCategory]
  )

  const categoryOptions = useMemo(() => buildCategoryOptions(modalCategories), [modalCategories])
  const subCategoryOptions = useMemo(
    () => buildSubCategoryOptions(selectedCategory?.subCategories ?? []),
    [selectedCategory]
  )
  const childSubCategoryOptions = useMemo(
    () => buildSubCategoryOptions(selectedSubCategory?.childSubCategories ?? []),
    [selectedSubCategory]
  )

  useEffect(() => {
    managedPhotosRef.current = managedPhotos
  }, [managedPhotos])

  useEffect(() => {
    if (!open) {
      managedPhotosRef.current.forEach((photo) => {
        if (photo.type === 'new') {
          URL.revokeObjectURL(photo.previewUrl)
        }
      })
      form.resetFields()
      setManagedPhotos([])
      setModalCategories([])
      setIsDescCustomized(false)
      setIsDescManuallyCleared(false)
      previousTemplateDescRef.current = ''
      return
    }

    setManagedPhotos(buildInitialManagedPhotos(product))
    setIsDescManuallyCleared(false)

    if (product) {
      form.setFieldsValue({
        c_price: product.c_price,
        desc: product.desc,
        f_price: product.f_price ?? undefined,
        inStock: product.inStock,
        name: product.name,
        price: product.price
      })
    } else {
      form.resetFields()
    }

    void (async () => {
      setIsCategoriesLoading(true)

      try {
        const nextCategories = await categoriesApi.getCategories()
        setModalCategories(nextCategories)

        if (!product) {
          previousTemplateDescRef.current = ''
          return
        }

        const selectionPath = findProductCategorySelectionPath(nextCategories, product.subCategoryId)
        const templateDesc = findTemplateDesc(nextCategories, selectionPath)

        form.setFieldsValue({
          c_price: product.c_price,
          categoryId: selectionPath?.categoryId,
          childSubCategoryId: selectionPath?.childSubCategoryId,
          desc: product.desc,
          f_price: product.f_price ?? undefined,
          inStock: product.inStock,
          name: product.name,
          price: product.price,
          subCategoryId: selectionPath?.subCategoryId
        })

        previousTemplateDescRef.current = templateDesc
        setIsDescCustomized(product.desc.trim() !== templateDesc.trim())
      } catch {
        message.error('Не удалось загрузить дерево категорий.')
      } finally {
        setIsCategoriesLoading(false)
      }
    })()
  }, [form, message, open, product])

  useEffect(
    () => () => {
      managedPhotos.forEach((photo) => {
        if (photo.type === 'new') {
          URL.revokeObjectURL(photo.previewUrl)
        }
      })
    },
    [managedPhotos]
  )

  useEffect(() => {
    if (!open || isCategoriesLoading) {
      return
    }

    const currentDesc = form.getFieldValue('desc') ?? ''
    const previousTemplateDesc = previousTemplateDescRef.current
    const templateChanged = currentTemplateDesc !== previousTemplateDesc

    if (isDescManuallyCleared) {
      if (templateChanged) {
        form.setFieldValue('desc', currentTemplateDesc)
        setIsDescCustomized(false)
        setIsDescManuallyCleared(false)
      }

      previousTemplateDescRef.current = currentTemplateDesc
      return
    }

    const shouldReplace =
      !isDescCustomized || !currentDesc.trim() || currentDesc === previousTemplateDesc

    if (shouldReplace) {
      form.setFieldValue('desc', currentTemplateDesc)
      setIsDescCustomized(false)
    }

    previousTemplateDescRef.current = currentTemplateDesc
  }, [currentTemplateDesc, form, isCategoriesLoading, isDescCustomized, isDescManuallyCleared, open])

  const appendFiles = (files: File[]) => {
    if (files.length === 0) {
      return
    }

    setManagedPhotos((current) => {
      const freeSlots = MAX_PHOTOS - current.length

      if (freeSlots <= 0) {
        return current
      }

      const nextPhotos = files.slice(0, freeSlots).map((file) => {
        const previewUrl = canRenderImagePreview(file) ? URL.createObjectURL(file) : ''
        const uploadFile: UploadFile = {
          lastModified: file.lastModified,
          name: file.name,
          originFileObj: file as UploadFile['originFileObj'],
          size: file.size,
          status: 'done',
          type: file.type,
          uid: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
          url: previewUrl
        }

        return {
          file: uploadFile,
          previewUrl,
          type: 'new' as const
        }
      })

      return [...current, ...nextPhotos]
    })
  }

  const handleDeletePhoto = (targetId: string) => {
    setManagedPhotos((current) => {
      const targetPhoto = current.find((photo) => getManagedPhotoId(photo) === targetId)

      if (targetPhoto?.type === 'new') {
        URL.revokeObjectURL(targetPhoto.previewUrl)
      }

      return current.filter((photo) => getManagedPhotoId(photo) !== targetId)
    })
  }

  const handleMakePrimary = (targetId: string) => {
    setManagedPhotos((current) => {
      const next = [...current]
      const targetIndex = next.findIndex((photo) => getManagedPhotoId(photo) === targetId)

      if (targetIndex <= 0) {
        return current
      }

      const [primaryPhoto] = next.splice(targetIndex, 1)
      next.unshift(primaryPhoto)

      return next
    })
  }

  const handleResetTemplate = () => {
    form.setFieldValue('desc', '')
    setIsDescCustomized(true)
    setIsDescManuallyCleared(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (managedPhotos.length === 0) {
        message.error('Добавьте хотя бы одну фотографию.')
        return
      }

      setIsSaving(true)

      const photosToKeep = managedPhotos
        .filter((photo): photo is IExistingPhoto => photo.type === 'existing')
        .map((photo) => photo.key)
      const newPhotosToUpload = collectNewPhotoFiles(managedPhotos)
      const subCategoryId = getFinalSubCategoryId(values)

      if (product) {
        await productsApi.updateProduct(product.id, {
          c_price: values.c_price,
          desc: values.desc.trim(),
          f_price: typeof values.f_price === 'number' ? values.f_price : undefined,
          inStock: values.inStock,
          name: values.name.trim(),
          newPhotos: newPhotosToUpload,
          photos: photosToKeep,
          price: values.price,
          subCategoryId
        })
        message.success('Товар обновлён.')
      } else {
        await productsApi.createProduct({
          c_price: values.c_price,
          desc: values.desc.trim(),
          f_price: typeof values.f_price === 'number' ? values.f_price : undefined,
          inStock: values.inStock,
          name: values.name.trim(),
          photos: newPhotosToUpload,
          price: values.price,
          subCategoryId
        })
        message.success('Товар создан.')
      }

      await onSaved()
      onClose()
    } catch (error) {
      if ((error as { errorFields?: unknown }).errorFields) {
        return
      }

      message.error('Не удалось сохранить товар.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal
      destroyOnHidden
      okButtonProps={{
        disabled: isCategoriesLoading,
        loading: isSaving
      }}
      okText={product ? 'Сохранить' : 'Создать'}
      onCancel={onClose}
      onOk={() => void handleSubmit()}
      open={open}
      title={product ? 'Редактирование товара' : 'Создание товара'}
      width={960}
    >
      <div className={styles.modalSection}>
        <Form form={form} layout='vertical'>
          <Form.Item
            label='Название'
            name='name'
            rules={[{ required: true, message: 'Введите название товара' }]}
          >
            <Input placeholder='Например, Testosterone Enanthate 250' />
          </Form.Item>

          <div className={styles.categoryBlock}>
            <Typography.Text className={styles.categoryLabel}>Категории</Typography.Text>

            {isCategoriesLoading ? (
              <div className={styles.categoryLoading}>
                <Spin size='small' />
                <span>Загружаем дерево категорий...</span>
              </div>
            ) : (
              <Space className={styles.categoryRow} size={16}>
                <Form.Item
                  className={styles.categoryField}
                  label='Категория'
                  name='categoryId'
                  rules={[{ required: true, message: 'Выберите категорию' }]}
                >
                  <Select
                    onChange={() => {
                      form.setFieldValue('subCategoryId', undefined)
                      form.setFieldValue('childSubCategoryId', undefined)
                    }}
                    options={categoryOptions}
                    placeholder='Выберите категорию'
                  />
                </Form.Item>

                <Form.Item
                  className={styles.categoryField}
                  label='Подкатегория'
                  name='subCategoryId'
                  rules={[{ required: true, message: 'Выберите подкатегорию' }]}
                >
                  <Select
                    disabled={!selectedCategory}
                    onChange={() => {
                      form.setFieldValue('childSubCategoryId', undefined)
                    }}
                    options={subCategoryOptions}
                    placeholder='Выберите подкатегорию'
                  />
                </Form.Item>

                <Form.Item
                  className={styles.categoryField}
                  label='Подподкатегория'
                  name='childSubCategoryId'
                >
                  <Select
                    allowClear
                    disabled={!selectedSubCategory || childSubCategoryOptions.length === 0}
                    options={childSubCategoryOptions}
                    placeholder='Опционально'
                  />
                </Form.Item>
              </Space>
            )}
          </div>

          <Form.Item
            label='Описание'
            name='desc'
            rules={[{ required: true, message: 'Введите описание' }]}
          >
            <Input.TextArea
              onChange={(event) => {
                if (isDescManuallyCleared && event.target.value.trim()) {
                  setIsDescManuallyCleared(false)
                }
                setIsDescCustomized(event.target.value.trim() !== currentTemplateDesc.trim())
              }}
              placeholder='Описание товара'
              rows={4}
            />
          </Form.Item>

          <div className={styles.descActions}>
            <Button onClick={handleResetTemplate}>Сбросить</Button>
          </div>

          <Space className={styles.numberRow} size={16}>
            <Form.Item
              label='Цена'
              name='price'
              rules={[{ required: true, message: 'Укажите цену' }]}
            >
              <InputNumber min={0} placeholder='0' style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label='Старая цена' name='f_price'>
              <InputNumber min={0} placeholder='Опционально' style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label='Себестоимость'
              name='c_price'
              rules={[{ required: true, message: 'Укажите себестоимость' }]}
            >
              <InputNumber min={0} placeholder='0' style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label='Остаток'
              name='inStock'
              rules={[{ required: true, message: 'Укажите остаток' }]}
            >
              <InputNumber min={0} placeholder='0' style={{ width: '100%' }} />
            </Form.Item>
          </Space>
        </Form>

        <div>
          <Typography.Title level={5}>Фотографии</Typography.Title>
          <Typography.Paragraph className={styles.uploadHint}>
            До 5 фото. Первое фото считается основным.
          </Typography.Paragraph>

          <UploadDropZone
            accept='.jpg,.jpeg,.png,.webp,.heic,.heif,image/*'
            buttonText='Выбрать фото'
            className={styles.dropzone}
            compact={managedPhotos.length > 0}
            disabled={managedPhotos.length >= MAX_PHOTOS}
            hintPrimary='Перетащите фото сюда или нажмите для выбора'
            hintSecondary={`JPG, PNG, WEBP, HEIC. До ${MAX_PHOTOS} файлов.`}
            maxFiles={MAX_PHOTOS - managedPhotos.length}
            onFilesChange={appendFiles}
          />

          {managedPhotos.length > 0 ? (
            <div className={styles.photoGrid}>
              {managedPhotos.map((photo, index) => {
                const photoId = getManagedPhotoId(photo)
                const photoUrl = getManagedPhotoUrl(photo)
                const isPrimary = index === 0

                return (
                  <div
                    className={isPrimary ? styles.photoCardActive : styles.photoCard}
                    key={photoId}
                  >
                    <button
                      className={styles.photoDeleteButton}
                      onClick={() => handleDeletePhoto(photoId)}
                      type='button'
                    >
                      <CloseOutlined />
                    </button>

                    <div className={styles.photoThumb}>
                      {photoUrl ? (
                        <img alt='' src={photoUrl} />
                      ) : (
                        <div className={styles.coverFallback}>
                          {photo.type === 'new'
                            ? getFileExtension(photo.file.name).toUpperCase() || 'FILE'
                            : 'Без превью'}
                        </div>
                      )}
                    </div>

                    <button
                      className={isPrimary ? styles.primaryButtonActive : styles.primaryButton}
                      disabled={isPrimary}
                      onClick={() => handleMakePrimary(photoId)}
                      type='button'
                    >
                      {isPrimary ? 'Основное' : 'Сделать основным'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyPhotoInline}>
              <Typography.Text type='secondary'>Фотографии пока не добавлены</Typography.Text>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
