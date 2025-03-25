const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware')
const jwtMiddleware = require('../middleware/jwtMiddleware')
const router = express.Router()
const dotenv = require('dotenv')

dotenv.config()

// Helper function to remove trailing slash from target URLs
const removeTrailingSlash = url => url.replace(/\/$/, '')

// Define downstream services with environment variables
const services = {
  '/users': process.env.USER_SERVICE_URL, // User Service
  '/admin': process.env.USER_SERVICE_URL, // User Service (Admin & Super Admin)
  '/posts': process.env.POST_SERVICE_URL, // Post Service
  '/replies': process.env.REPLY_SERVICE_URL, // Reply Service
  '/history': process.env.HISTORY_SERVICE_URL, // History Service
  '/messages': process.env.MESSAGE_SERVICE_URL, // Message Service
  '/auth': process.env.AUTH_SERVICE_URL, // Auth Service
  '/email': process.env.EMAIL_SERVICE_URL, // Email Service
  '/files': process.env.FILE_SERVICE_URL // File Service
}

// Log service configurations
console.log(
  '🚀 API Gateway starting with the following service configurations:'
)
Object.entries(services).forEach(([route, target]) => {
  console.log(`  ${route} -> ${target}`)
})

// Ensure JSON is forwarded correctly
router.use(express.json())
router.use(express.urlencoded({ extended: true }))

// Set up proxy routes dynamically
Object.entries(services).forEach(([route, target]) => {
  if (target) {
    target = removeTrailingSlash(target)
    console.log(`🔧 Setting up proxy for ${route} -> ${target}`)

    // Apply JWT middleware for all routes except specific ones
    if (route !== '/auth') {
      router.use(route, (req, res, next) => {
        if (
          req.originalUrl.startsWith('/users/register') || // Allow user registration without JWT
          (req.method === 'POST' && req.originalUrl.startsWith('/messages')) || // Allow creating messages without JWT
          (req.method === 'PUT' && req.originalUrl.match(/^\/messages\/\d+$/)) // Allow updating messages without JWT
        ) {
          console.log(
            `Skipping JWT middleware for: ${req.method} ${req.originalUrl}`
          )
          return next()
        }

        jwtMiddleware(req, res, next)
      })
      console.log(`Applied JWT middleware for: ${route}`)
    }

    router.use(
      route,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: route === '/auth' ? {} : { [`^${route}`]: route }, // Keep route paths intact
        onProxyReq: (proxyReq, req, res) => {
          console.log(
            `[Proxy] Forwarding ${req.method} ${req.originalUrl} -> ${target}${req.path}`
          )

          // Forward Authorization Header
          if (req.headers['authorization']) {
            proxyReq.setHeader('Authorization', req.headers['authorization'])
            console.log(` Forwarding Authorization header`)
          }

          // Prevent invalid headers
          if (req.user) {
            proxyReq.setHeader('X-User-ID', req.user.id)
            proxyReq.setHeader('X-User-Role', req.user.role)
            proxyReq.setHeader(
              'X-User-Verified',
              req.user.verified ? 'true' : 'false'
            )

            console.log(
              `📝 Injecting user info -> ID: ${req.user.id}, Role: ${
                req.user.role
              }, Verified: ${req.user.verified ? 'true' : 'false'}`
            )
          } else {
            // Default header if no user object exists
            proxyReq.setHeader('X-User-Verified', 'false')
          }

          // Forward request body for POST, PUT, PATCH requests
          const contentType = req.headers['content-type'] || ''
          if (
            req.body &&
            (req.method === 'POST' ||
              req.method === 'PUT' ||
              req.method === 'PATCH')
          ) {
            if (contentType.includes('application/json')) {
              let bodyData = JSON.stringify(req.body)
              proxyReq.setHeader('Content-Type', 'application/json')
              proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData))
              proxyReq.write(bodyData)
            } else {
              console.log(`Skipping JSON conversion for multipart/form-data`)
            }
          }
        },
        onError: (err, req, res) => {
          console.error(`Proxy error for ${req.originalUrl}:`, err.message)
          res.status(500).json({ message: 'Proxy error', error: err.message })
        }
      })
    )

    console.log(`Proxy set up for ${route} -> ${target}`)
  }
})

module.exports = router
