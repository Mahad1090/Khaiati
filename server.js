/**
 * Custom Node.js server for Next.js.
 *
 * Hostinger's Node.js hosting starts this file directly (`node server.js`)
 * instead of `next start`. The things that actually stop "process spikes"
 * on a managed Node host:
 *   1. Bind to the PORT the host assigns via env var, never a hardcoded one.
 *   2. Exit cleanly on SIGTERM/SIGINT so the process manager can restart
 *      the app without leaving an old instance holding the port.
 *   3. Exit (instead of hanging) on uncaught errors, so a crash is one
 *      clean restart instead of a zombie/duplicate process pile-up.
 */
const { createServer } = require('http')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT) || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

let server
let shuttingDown = false

app
  .prepare()
  .then(() => {
    server = createServer((req, res) => {
      handle(req, res)
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use — another instance may already be running.`)
        process.exit(1)
      }
      console.error('Server error:', err)
      process.exit(1)
    })

    server.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to start Next.js app:', err)
    process.exit(1)
  })

function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`Received ${signal}, shutting down gracefully...`)

  if (!server) {
    process.exit(0)
    return
  }

  server.close((err) => {
    if (err) {
      console.error('Error while closing server:', err)
      process.exit(1)
    }
    process.exit(0)
  })

  // Force-exit if something keeps the event loop alive too long.
  setTimeout(() => {
    console.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
  process.exit(1)
})
