const jwt = require('jsonwebtoken')
require('dotenv').config()

const jwtMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header.' })
  }

  const token = authHeader.split(' ')[1]

  jwt.verify(
    token,
    process.env.JWT_SECRET,
    { algorithms: [process.env.JWT_ALGORITHM] },
    (err, decoded) => {
      if (err) {
        console.error('[JWT Middleware] Invalid or expired token.')
        return res.status(401).json({ error: 'Invalid or expired token.' })
      }

      // Extract user details from token
      req.user = {
        id: decoded.user_id,
        role: decoded.role,
        verified: decoded.verified,
        active: decoded.active
      }

      console.log(
        `[JWT Middleware] Authenticated -> ID: ${req.user.id}, Role: ${req.user.role}, Verified: ${req.user.verified}, Active: ${req.user.active}`
      )
      next()
    }
  )
}
module.exports = jwtMiddleware
