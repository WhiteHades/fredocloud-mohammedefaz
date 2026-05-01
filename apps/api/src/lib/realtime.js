const { Server } = require("socket.io");

const { verifyAccessToken, ACCESS_COOKIE_NAME } = require("./auth");
const { getWorkspaceAccess } = require("./workspace-access");

let io = null;

const workspacePresence = new Map();

function parseCookieHeader(cookieHeader) {
  return Object.fromEntries(
    (cookieHeader || "")
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const separatorIndex = entry.indexOf("=");
        return [entry.slice(0, separatorIndex), decodeURIComponent(entry.slice(separatorIndex + 1))];
      }),
  );
}

function getWorkspaceRoom(workspaceId) {
  return `workspace:${workspaceId}`;
}

function emitPresence(workspaceId) {
  if (!io) {
    return;
  }

  const presenceMap = workspacePresence.get(workspaceId) || new Map();
  io.to(getWorkspaceRoom(workspaceId)).emit("workspace:presence", {
    workspaceId,
    onlineUserIds: [...presenceMap.keys()],
  });
}

function addPresence(workspaceId, userId, socketId) {
  const presenceMap = workspacePresence.get(workspaceId) || new Map();
  const socketIds = presenceMap.get(userId) || new Set();

  socketIds.add(socketId);
  presenceMap.set(userId, socketIds);
  workspacePresence.set(workspaceId, presenceMap);
  emitPresence(workspaceId);
}

function removePresence(workspaceId, userId, socketId) {
  const presenceMap = workspacePresence.get(workspaceId);

  if (!presenceMap) {
    return;
  }

  const socketIds = presenceMap.get(userId);

  if (!socketIds) {
    return;
  }

  socketIds.delete(socketId);

  if (socketIds.size === 0) {
    presenceMap.delete(userId);
  }

  if (presenceMap.size === 0) {
    workspacePresence.delete(workspaceId);
  }

  emitPresence(workspaceId);
}

function attachRealtime(server, clientUrl) {
  io = new Server(server, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const cookies = parseCookieHeader(cookieHeader);
      const token = cookies[ACCESS_COOKIE_NAME];

      if (!token) {
        next(new Error("Authentication required."));
        return;
      }

      const payload = verifyAccessToken(token);
      socket.data.auth = {
        userId: payload.sub,
        email: payload.email,
      };
      next();
    } catch {
      next(new Error("Authentication required."));
    }
  });

  io.on("connection", (socket) => {
    socket.on("workspace:subscribe", async ({ workspaceId }) => {
      const membership = await getWorkspaceAccess(socket.data.auth.userId, workspaceId);

      if (!membership) {
        socket.emit("workspace:error", { workspaceId, error: "Membership required." });
        return;
      }

      socket.data.workspaceId = workspaceId;
      socket.join(getWorkspaceRoom(workspaceId));
      addPresence(workspaceId, socket.data.auth.userId, socket.id);
    });

    socket.on("disconnect", () => {
      if (socket.data.workspaceId) {
        removePresence(socket.data.workspaceId, socket.data.auth.userId, socket.id);
      }
    });
  });

  return io;
}

function emitWorkspaceEvent(workspaceId, event, payload) {
  if (!io) {
    return;
  }

  io.to(getWorkspaceRoom(workspaceId)).emit(event, payload);
}

function emitNotificationEvent(userId, payload) {
  if (!io) {
    return;
  }

  io.emit("notification:created", {
    userId,
    ...payload,
  });
}

module.exports = {
  attachRealtime,
  emitNotificationEvent,
  emitWorkspaceEvent,
};
