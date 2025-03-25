const authenticateUser = (requiredRoles = [], requireVerified = false) => {
  return (req, res, next) => {
    console.log(req.headers)
    const userId = req.headers['x-user-id']
      ? parseInt(req.headers['x-user-id'])
      : null
    const userRole = req.headers['x-user-role'] || null
    const userVerified = req.headers['x-user-verified'] === 'true'
    console.log(userId)
    console.log(userRole)

    // ✅ Ensure user is authenticated if required
    if (requiredRoles.length > 0 && !userRole) {
      console.log('HERE!!!')
      return res
        .status(401)
        .json({ error: 'Unauthorized: Missing authentication headers' })
    }

    // ✅ Check if role is allowed
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      console.log('HERE!!!2')

      return res
        .status(403)
        .json({ error: 'Forbidden: You do not have permission to access this' })
    }

    // ✅ Enforce email verification if required
    if (requireVerified && !userVerified) {
      console.log('HERE3!!!')

      return res.status(403).json({
        error: 'Forbidden: You must verify your email to access this resource'
      })
    }

    // ✅ Attach extracted user info to request
    req.user = { id: userId, role: userRole, verified: userVerified }
    next()
  }
}

module.exports = authenticateUser
