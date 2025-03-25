const { DataTypes } = require('sequelize')
const sequelize = require('../config/databases') // ✅ Ensure this is correctly imported

const Message = sequelize.define(
  'Message',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: true }, // Nullable for guests
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    subject: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved'),
      defaultValue: 'pending'
    }
  },
  {
    tableName: 'messages' // ✅ Ensures Sequelize queries the correct table name
  }
)

module.exports = Message
