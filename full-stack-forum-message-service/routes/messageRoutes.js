const express = require('express')
const router = express.Router()
const messageController = require('../controllers/messageController')
const authenticateUser = require('../middleware/authMiddleware')

// 📩 Submit a new message (Public)
router.post('/', messageController.createMessage)

// 📥 Fetch all messages (Admin only)
router.get('/', authenticateUser(['admin','super_admin']), messageController.getAllMessages)

// 📩 Fetch a specific message (Admin only)
router.get(
  '/:id',
  authenticateUser(['admin','super_admin']),
  messageController.getMessageById
)

// Update message status (Admin only)
router.put(
  '/:id/status',
  authenticateUser(['admin','super_admin']),
  messageController.updateMessageStatus
)

module.exports = router
