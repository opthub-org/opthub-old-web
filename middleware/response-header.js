export default (_, res, next) => {
  res.setHeader('cache-control', 'no-cache, no-store, must-revalidate')
  next()
}
