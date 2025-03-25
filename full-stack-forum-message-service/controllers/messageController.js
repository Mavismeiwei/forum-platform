const Message = require('../models/messageModel')

// 📩 Public: Create a new message
exports.createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'All fields (name, email, subject, message) are required.'
      })
    }

    // ✅ Extract user ID from headers (if available), otherwise set to NULL
    const userId = req.user?.id || null

    const newMessage = await Message.create({
      userId,
      name,
      email,
      subject,
      message
    })

    res.status(201).json(newMessage)
  } catch (error) {
    console.error('❌ Error creating message:', error)
    res
      .status(500)
      .json({ error: 'Internal server error.', details: error.message })
  }
}

// 📥 Admin Only: Fetch all messages (Middleware handles role checking)
exports.getAllMessages = async (req, res) => {
  try {
    const messages = await Message.findAll()

    if (!messages.length) {
      return res.status(404).json({ error: 'No messages!' })
    }

    res.status(200).json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

// 📩 Admin Only: Fetch a specific message
exports.getMessageById = async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id)
    if (!message) {
      return res.status(404).json({ error: 'Message not found.' })
    }

    res.status(200).json(message)
  } catch (error) {
    console.error('Error fetching message:', error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}

// ✅ Admin Only: Update message status
exports.updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'reviewed', 'resolved']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' })
    }

    const message = await Message.findByPk(req.params.id)
    if (!message) {
      return res.status(404).json({ error: 'Message not found.' })
    }

    message.status = status
    await message.save()

    res.status(200).json({ message: 'Message status updated.', data: message })
  } catch (error) {
    console.error('❌ Error updating message status:', error)
    res.status(500).json({ error: 'Internal server error.' })
  }
}
