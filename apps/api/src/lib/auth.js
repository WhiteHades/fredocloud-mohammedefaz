const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const { config } = require("./env");

const ACCESS_COOKIE_NAME = "notfredohub_access_token";
const REFRESH_COOKIE_NAME = "notfredohub_refresh_token";
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function createAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    config.jwtAccessSecret,
    { expiresIn: "15m" },
  );
}

function createRefreshToken(payload) {
  return jwt.sign(
    {
      sub: payload.userId,
      sid: payload.sessionId,
    },
    config.jwtRefreshSecret,
    { expiresIn: "7d" },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtAccessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwtRefreshSecret);
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createCookieOptions(maxAge) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function setAuthCookies(response, tokens) {
  response.cookie(
    ACCESS_COOKIE_NAME,
    tokens.accessToken,
    createCookieOptions(ACCESS_TOKEN_MAX_AGE_MS),
  );
  response.cookie(
    REFRESH_COOKIE_NAME,
    tokens.refreshToken,
    createCookieOptions(REFRESH_TOKEN_MAX_AGE_MS),
  );
}

function clearAuthCookies(response) {
  response.clearCookie(ACCESS_COOKIE_NAME, createCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
  response.clearCookie(REFRESH_COOKIE_NAME, createCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));
}

module.exports = {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_MS,
  clearAuthCookies,
  createAccessToken,
  createRefreshToken,
  hashToken,
  setAuthCookies,
  verifyAccessToken,
  verifyRefreshToken,
};
