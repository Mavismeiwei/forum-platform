const express = require('express')
const dotenv = require('dotenv')
const sequelize = require('./config/databases')
const messageRoutes = require('./routes/messageRoutes')

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5005

app.use(express.json())
app.use('/messages', messageRoutes)

app.listen(PORT, async () => {
  console.log(`📩 Message Service running on port ${PORT}`)

  try {
    await sequelize.sync({ alter: true }) // Sync database
    console.log('✅ Database synchronized')
  } catch (error) {
    console.error('❌ Error syncing database:', error)
  }
})
