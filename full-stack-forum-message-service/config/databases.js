const { Sequelize } = require('sequelize')
require('dotenv').config()

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: 'mysql',
    port: process.env.DATABASE_PORT || 3306,
    logging: false // Set to true for debugging
  }
)

async function testConnection () {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connected successfully!')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  }
}

testConnection()

module.exports = sequelize
