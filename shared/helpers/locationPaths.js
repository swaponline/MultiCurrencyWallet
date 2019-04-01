const mainPagePaths = [
  '/',
  '/ru',
]

export const isMainOrPartialPages = (pathname) =>
  mainPagePaths.reduce((acc, item) => acc || pathname === item || pathname.includes('/exchange'), false)
