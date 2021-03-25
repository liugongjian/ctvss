import Cookies from 'js-cookie'

// App
const sidebarStatusKey = 'sidebar_status'
export const getSidebarStatus = () => Cookies.get(sidebarStatusKey)
export const setSidebarStatus = (sidebarStatus: string) => Cookies.set(sidebarStatusKey, sidebarStatus)

// const languageKey = 'language'
// export const getLanguage = () => Cookies.get(languageKey)
// export const setLanguage = (language: string) => Cookies.set(languageKey, language)

const sizeKey = 'size'
export const getSize = () => Cookies.get(sizeKey)
export const setSize = (size: string) => Cookies.set(sizeKey, size)

// Token
const tokenKey = 'live_admin_access_token'
export const getToken = () => Cookies.get(tokenKey)
export const setToken = (token: string) => Cookies.set(tokenKey, token)
export const removeToken = () => Cookies.remove(tokenKey)

// Username
const username = 'username'
export const getUsername = () => Cookies.get(username)
export const setUsername = (token: string) => Cookies.set(username, token)
export const removeUsername = () => Cookies.remove(username)

// perms
const permsKey = 'perms'
export const getPerms = () => Cookies.get(permsKey) || []
export const setPerms = (perms: string[]) => Cookies.set(permsKey, perms)
export const removePerms = () => Cookies.remove(permsKey)

// isIamUserLogin
const loginTypeKey = 'isIamUserLogin'
export const getIsIamUserLogin = () => Cookies.get(loginTypeKey)
export const setIsIamUserLogin = (type: string) => Cookies.set(loginTypeKey, type)
export const removeIsIamUserLogin = () => Cookies.remove(loginTypeKey)

// iamUserId
const iamUserIdKey = 'iamUserId'
export const getIamUserId = () => Cookies.get(iamUserIdKey)
export const setIamUserId = (id: string) => Cookies.set(iamUserIdKey, id)
export const removeIamUserId = () => () => Cookies.remove(iamUserIdKey)
