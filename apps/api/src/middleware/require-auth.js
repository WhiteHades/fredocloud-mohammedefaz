const { ACCESS_COOKIE_NAME, verifyAccessToken } = require("../lib/auth");

function requireAuth(request, response, next) {
  const token = request.cookies[ACCESS_COOKIE_NAME];

  if (!token) {
    return response.status(401).json({ error: "Authentication required." });
  }

  try {
    const payload = verifyAccessToken(token);

    request.auth = {
      userId: payload.sub,
      email: payload.email,
    };

    return next();
  } catch {
    return response.status(401).json({ error: "Authentication required." });
  }
}

module.exports = { requireAuth };
