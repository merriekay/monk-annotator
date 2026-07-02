// Standalone production server: serves the built frontend (dist/, from
// `npm run build`) plus the same /api/signers and /api/frame routes used in
// dev (server/kaggleRoutes.js), behind HTTP Basic Auth. Basic auth exists
// because, unlike the local dev tool, this process may be reachable on a
// public IP/URL -- without it, anyone who finds the URL could burn through
// your Kaggle API quota and view the (access-gated) FSboard footage through
// your server. Run with `npm start` after `npm run build`.
import { createServer } from 'node:http'
import { existsSync } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { timingSafeEqual } from 'node:crypto'
import path from 'node:path'
import { createKaggleRoutes } from './kaggleRoutes.js'

const PORT = process.env.PORT || 8080
const DIST_DIR = path.resolve('dist')
const AUTH_USER = process.env.BASIC_AUTH_USER
const AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
}

// Constant-time comparison so a timing attack can't be used to guess the
// password one byte at a time.
function safeEqual(a, b) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

function isAuthorized(req) {
  if (!AUTH_USER || !AUTH_PASSWORD) return true // no credentials configured: auth disabled
  const header = req.headers.authorization ?? ''
  const [scheme, encoded] = header.split(' ')
  if (scheme !== 'Basic' || !encoded) return false
  const [user, password] = Buffer.from(encoded, 'base64').toString('utf-8').split(':')
  return safeEqual(user ?? '', AUTH_USER) && safeEqual(password ?? '', AUTH_PASSWORD)
}

async function serveStatic(pathname, res) {
  const requestedPath = path.normalize(path.join(DIST_DIR, pathname))
  // Guard against path traversal (e.g. "/../../etc/passwd") escaping dist/.
  let filePath = requestedPath.startsWith(DIST_DIR) ? requestedPath : DIST_DIR

  const exists = existsSync(filePath) && (await stat(filePath)).isFile()
  if (!exists) {
    // SPA fallback: any non-file route (client-side routing, or a bad path)
    // gets index.html.
    filePath = path.join(DIST_DIR, 'index.html')
  }

  res.setHeader('Content-Type', MIME_TYPES[path.extname(filePath)] ?? 'application/octet-stream')
  res.end(await readFile(filePath))
}

if (!existsSync(DIST_DIR)) {
  console.error('dist/ not found -- run `npm run build` before `npm start`.')
  process.exit(1)
}
if (!AUTH_USER || !AUTH_PASSWORD) {
  console.warn(
    '[server] BASIC_AUTH_USER / BASIC_AUTH_PASSWORD are not set -- this server will be reachable without a login.',
  )
}

const { handleSigners, handleFrame } = createKaggleRoutes(process.env.KAGGLE_API_TOKEN)

const server = createServer(async (req, res) => {
  if (!isAuthorized(req)) {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="MST Annotation Tool"')
    res.end('Authentication required')
    return
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`)

  try {
    if (pathname === '/api/signers') {
      await handleSigners(req, res)
    } else if (pathname.startsWith('/api/frame/')) {
      req.url = pathname.slice('/api/frame'.length)
      await handleFrame(req, res)
    } else {
      await serveStatic(pathname, res)
    }
  } catch (err) {
    res.statusCode = 500
    res.end(String(err.message ?? err))
  }
})

server.listen(PORT, () => {
  console.log(`MST annotation tool listening on http://localhost:${PORT}`)
})
