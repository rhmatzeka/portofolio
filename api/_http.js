class HttpError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

const sendJson = (res, statusCode, payload, { cacheControl } = {}) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  if (cacheControl) res.setHeader('Cache-Control', cacheControl)
  res.end(JSON.stringify(payload))
}

const assertBodySize = (size, maxBytes) => {
  if (maxBytes && size > maxBytes) {
    throw new HttpError('Request body is too large.', 413)
  }
}

const readJsonBody = async (req, { maxBytes } = {}) => {
  const contentLength = Number(req.headers?.['content-length'])
  if (Number.isFinite(contentLength)) assertBodySize(contentLength, maxBytes)

  if (typeof req.body === 'string') {
    assertBodySize(Buffer.byteLength(req.body, 'utf8'), maxBytes)
    return JSON.parse(req.body)
  }

  if (req.body && typeof req.body === 'object') {
    assertBodySize(Buffer.byteLength(JSON.stringify(req.body), 'utf8'), maxBytes)
    return req.body
  }

  const chunks = []
  let size = 0

  for await (const chunk of req) {
    size += chunk.length
    assertBodySize(size, maxBytes)
    chunks.push(chunk)
  }

  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

module.exports = { HttpError, readJsonBody, sendJson }
