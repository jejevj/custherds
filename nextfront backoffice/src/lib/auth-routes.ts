const LOGIN_PATHS = {
  admin: '/admin/login',
  guide: '/guide/login',
  vendor: '/vendor/login',
} as const

export function getPortalRole(pathname: string) {
  const role = pathname.split('/')[1]
  return role === 'admin' || role === 'guide' || role === 'vendor' ? role : null
}

export function getLoginPath(pathname: string) {
  const role = getPortalRole(pathname)
  return role ? LOGIN_PATHS[role] : null
}
