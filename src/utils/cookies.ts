import Cookies from 'js-cookie'
export default Cookies

// App
const sidebarStatusKey = 'sidebar_status'
export const getSidebarStatus = () => Cookies.get(sidebarStatusKey)
export const setSidebarStatus = (sidebarStatus: string) => Cookies.set(sidebarStatusKey, sidebarStatus)

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

// iamUserId
const iamUserIdKey = 'iamUserId'
export const getIamUserId = () => Cookies.get(iamUserIdKey)
export const setIamUserId = (id: string) => Cookies.set(iamUserIdKey, id)
export const removeIamUserId = () => Cookies.remove(iamUserIdKey)

// ticket
export const removeTicket = (casDomain: string) => {
  Cookies.remove('ticket', { path: '/', domain: `.${casDomain}.cn` })
  const key = casDomain === 'ctcdn' ? 'cdn_tgc' : 'ct_tgc'
  Cookies.remove(key, { path: '/', domain: `.${casDomain}.cn` })
}
