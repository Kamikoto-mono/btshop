import { adminApi } from '../config'
import { mapUser } from './model'
import type { IAdminUsersListDto, IAdminUsersQuery } from './types'

const getUsers = async (params?: IAdminUsersQuery) => {
  const { data } = await adminApi.get<IAdminUsersListDto>('/admin/users', {
    params: {
      limit: params?.limit ?? 20,
      page: params?.page ?? 1
    }
  })

  return {
    items: data.items.map(mapUser),
    meta: data.meta
  }
}

export const usersApi = {
  getUsers
}
