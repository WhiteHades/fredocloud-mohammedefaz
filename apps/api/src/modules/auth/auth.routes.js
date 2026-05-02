const bcrypt = require("bcryptjs");
const { Router } = require("express");
const multer = require("multer");

const { normalizeEmail } = require("@notfredohub/shared");

const {
  REFRESH_COOKIE_NAME,
  REFRESH_TOKEN_MAX_AGE_MS,
  clearAuthCookies,
  createAccessToken,
  createRefreshToken,
  hashToken,
  setAuthCookies,
  verifyRefreshToken,
} = require("../../lib/auth");
const { prisma } = require("../../lib/prisma");
const { hasCloudinaryConfig, uploadImageBuffer } = require("../../lib/cloudinary");
const { requireAuth } = require("../../middleware/require-auth");

const authRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

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

async function resolveRefreshSession(request) {
  const refreshToken = request.cookies[REFRESH_COOKIE_NAME];

  if (!refreshToken) {
    return null;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);
    const session = await prisma.session.findUnique({ where: { id: payload.sid } });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.refreshTokenHash !== hashToken(refreshToken)
    ) {
      return null;
    }

    return {
      refreshToken,
      session,
      payload,
    };
  } catch {
    return null;
  }
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

authRouter.get("/socket-token", requireAuth, async (request, response) => {
  const socketToken = createAccessToken({
    id: request.auth.userId,
    email: request.auth.email,
  });

  return response.status(200).json({ socketToken });
});

authRouter.patch("/me", requireAuth, async (request, response) => {
  const displayName =
    typeof request.body.displayName === "string" && request.body.displayName.trim()
      ? request.body.displayName.trim()
      : null;
  const avatarPublicId =
    typeof request.body.avatarPublicId === "string" && request.body.avatarPublicId.trim()
      ? request.body.avatarPublicId.trim()
      : null;
  const avatarUrl =
    typeof request.body.avatarUrl === "string" && request.body.avatarUrl.trim()
      ? request.body.avatarUrl.trim()
      : null;

  const user = await prisma.user.update({
    where: { id: request.auth.userId },
    data: {
      displayName,
      avatarPublicId,
      avatarUrl,
    },
  });

  return response.status(200).json({ user: serializeUser(user) });
});

authRouter.post("/avatar", requireAuth, upload.single("file"), async (request, response) => {
  if (!hasCloudinaryConfig) {
    return response.status(503).json({
      error: "Cloudinary credentials are not configured for this environment.",
    });
  }

  if (!request.file) {
    return response.status(400).json({ error: "Avatar file is required." });
  }

  const uploadResult = await uploadImageBuffer(request.file.buffer, {
    folder: "notfredohub/avatars",
    public_id: `user_${request.auth.userId}_${Date.now()}`,
    overwrite: true,
    resource_type: "image",
  });

  const user = await prisma.user.update({
    where: { id: request.auth.userId },
    data: {
      avatarPublicId: uploadResult.public_id,
      avatarUrl: uploadResult.secure_url,
    },
  });

  return response.status(200).json({ user: serializeUser(user) });
});

authRouter.post("/refresh", async (request, response) => {
  const resolvedSession = await resolveRefreshSession(request);

  if (!resolvedSession) {
    clearAuthCookies(response);
    return response.status(401).json({ error: "Refresh token is invalid." });
  }

  const user = await prisma.user.findUnique({ where: { id: resolvedSession.payload.sub } });

  if (!user) {
    clearAuthCookies(response);
    return response.status(404).json({ error: "User not found." });
  }

  const nextRefreshToken = createRefreshToken({
    userId: user.id,
    sessionId: resolvedSession.session.id,
  });
  const nextAccessToken = createAccessToken(user);

  await prisma.session.update({
    where: { id: resolvedSession.session.id },
    data: {
      refreshTokenHash: hashToken(nextRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS),
    },
  });

  setAuthCookies(response, {
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
  });

  return response.status(200).json({ user: serializeUser(user) });
});

authRouter.post("/logout", async (request, response) => {
  const resolvedSession = await resolveRefreshSession(request);

  if (resolvedSession) {
    await prisma.session.update({
      where: { id: resolvedSession.session.id },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  clearAuthCookies(response);
  return response.status(204).send();
});

module.exports = { authRouter };
