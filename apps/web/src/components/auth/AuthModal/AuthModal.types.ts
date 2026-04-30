export interface ILoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

export interface IRegisterFormValues {
  email: string
  password: string
  passwordRepeat: string
}

export interface IPasswordResetRequestFormValues {
  email: string
}

export interface IPasswordResetConfirmFormValues {
  code: string
  newPassword: string
  newPasswordRepeat: string
}

export type TModalView = 'auth' | 'resetConfirm' | 'resetRequest'

export const loginDefaults: ILoginFormValues = {
  email: '',
  password: '',
  rememberMe: true
}

export const registerDefaults: IRegisterFormValues = {
  email: '',
  password: '',
  passwordRepeat: ''
}

export const passwordResetRequestDefaults: IPasswordResetRequestFormValues = {
  email: ''
}

export const passwordResetConfirmDefaults: IPasswordResetConfirmFormValues = {
  code: '',
  newPassword: '',
  newPasswordRepeat: ''
}
