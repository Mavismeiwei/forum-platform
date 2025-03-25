const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const proxyRoutes = require('./routes/proxyRoutes')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5009

app.use(cors())
app.use(express.json())

// Mount the proxy routes
app.use('/', proxyRoutes)

// Health check endpoint (public)
app.get('/', (req, res) => {
  res.json({ message: 'API Gateway is running' })
})

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.message)
  res.status(500).json({ message: 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
})
