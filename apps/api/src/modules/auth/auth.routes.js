const bcrypt = require("bcryptjs");
const { Router } = require("express");

const {
  REFRESH_TOKEN_MAX_AGE_MS,
  createAccessToken,
  createRefreshToken,
  hashToken,
  setAuthCookies,
} = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");
const { requireAuth } = require("../../middleware/require-auth");

const authRouter = Router();

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarPublicId: user.avatarPublicId,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function issueSession(response, user) {
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: "pending",
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    },
  });

  const refreshToken = createRefreshToken({
    userId: user.id,
    sessionId: session.id,
  });
  const accessToken = createAccessToken(user);

  await prisma.session.update({
    where: { id: session.id },
    data: {
      refreshTokenHash: hashToken(refreshToken),
    },
  });

  setAuthCookies(response, { accessToken, refreshToken });
}

authRouter.post("/register", async (request, response) => {
  const email = typeof request.body.email === "string" ? normalizeEmail(request.body.email) : "";
  const password = typeof request.body.password === "string" ? request.body.password : "";
  const displayName = typeof request.body.displayName === "string" ? request.body.displayName.trim() : "";

  if (!email || !password || password.length < 8) {
    return response.status(400).json({ error: "Email and password are required." });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return response.status(409).json({ error: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: displayName || null,
    },
  });

  await issueSession(response, user);

  return response.status(201).json({ user: serializeUser(user) });
});

authRouter.post("/login", async (request, response) => {
  const email = typeof request.body.email === "string" ? normalizeEmail(request.body.email) : "";
  const password = typeof request.body.password === "string" ? request.body.password : "";

  if (!email || !password) {
    return response.status(400).json({ error: "Email and password are required." });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return response.status(401).json({ error: "Invalid email or password." });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return response.status(401).json({ error: "Invalid email or password." });
  }

  await issueSession(response, user);

  return response.status(200).json({ user: serializeUser(user) });
});

authRouter.get("/me", requireAuth, async (request, response) => {
  const user = await prisma.user.findUnique({ where: { id: request.auth.userId } });

  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }

  return response.status(200).json({ user: serializeUser(user) });
});

module.exports = { authRouter };
