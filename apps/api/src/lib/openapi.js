const swaggerJsdoc = require("swagger-jsdoc");

const specification = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "notFredoHub API",
      version: "0.1.0",
      description:
        "Collaborative team hub API for authentication, workspaces, planning, broadcast, and analytics.",
    },
    servers: [
      { url: "/", description: "Same origin as the API" },
    ],
    paths: {
      "/api/health": {
        get: {
          summary: "Health check",
          tags: ["System"],
          responses: {
            200: {
              description: "API is healthy.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean" },
                      name: { type: "string" },
                      timestamp: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },

      /* ── Auth ─────────────────────────────────────────── */
      "/api/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                    displayName: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered and authenticated." },
            400: { description: "Validation error." },
            409: { description: "Email already in use." },
          },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Log in an existing user",
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Logged in. Cookies set." },
            401: { description: "Invalid credentials." },
          },
        },
      },
      "/api/auth/me": {
        get: {
          summary: "Get current user profile",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: "Current user." },
            401: { description: "Unauthorised." },
          },
        },
        patch: {
          summary: "Update user profile",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    displayName: { type: "string" },
                    avatarPublicId: { type: "string" },
                    avatarUrl: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Profile updated." },
            401: { description: "Unauthorised." },
          },
        },
      },
      "/api/auth/avatar": {
        post: {
          summary: "Upload a profile avatar",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file"],
                  properties: {
                    file: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Avatar uploaded." },
            503: { description: "Cloudinary not configured." },
          },
        },
      },
      "/api/auth/refresh": {
        post: {
          summary: "Refresh access token",
          tags: ["Auth"],
          responses: {
            200: { description: "Tokens refreshed." },
            401: { description: "Refresh token invalid." },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          summary: "Log out (revoke refresh token)",
          tags: ["Auth"],
          responses: { 204: { description: "Logged out." } },
        },
      },
      "/api/auth/socket-token": {
        get: {
          summary: "Issue a short-lived token for Socket.io auth",
          tags: ["Auth"],
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Socket token.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { socketToken: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },

      /* ── Workspaces ───────────────────────────────────── */
      "/api/workspaces": {
        get: {
          summary: "List memberships for the signed-in user",
          tags: ["Workspaces"],
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: "Membership list." } },
        },
        post: {
          summary: "Create a new workspace",
          tags: ["Workspaces"],
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    accentColor: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Workspace created." },
            400: { description: "Validation error." },
          },
        },
      },
      "/api/workspaces/invitations": {
        get: {
          summary: "List pending invitations for the current user",
          tags: ["Workspaces"],
          security: [{ cookieAuth: [] }],
          responses: { 200: { description: "Invitation list." } },
        },
      },
      "/api/workspaces/invitations/{invitationId}/accept": {
        post: {
          summary: "Accept a pending invitation",
          tags: ["Workspaces"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "invitationId", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Invitation accepted." },
            404: { description: "Invitation not found." },
            409: { description: "Already a member." },
          },
        },
      },
      "/api/workspaces/{workspaceId}": {
        patch: {
          summary: "Update workspace details (admin only)",
          tags: ["Workspaces"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                    accentColor: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Workspace updated." },
            403: { description: "Forbidden." },
          },
        },
      },
      "/api/workspaces/{workspaceId}/members": {
        get: {
          summary: "List members of a workspace",
          tags: ["Workspaces"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "Member list." } },
        },
      },
      "/api/workspaces/{workspaceId}/invitations": {
        post: {
          summary: "Invite a member by email (admin only)",
          tags: ["Workspaces"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: {
                    email: { type: "string", format: "email" },
                    role: { type: "string", enum: ["ADMIN", "MEMBER"] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Invitation created. Email sent if SMTP configured." },
            403: { description: "Forbidden." },
          },
        },
      },
      "/api/workspaces/{workspaceId}/members/{membershipId}/permissions": {
        patch: {
          summary: "Update a member's permission override (admin only)",
          tags: ["Workspaces"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
            { in: "path", name: "membershipId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["permission"],
                  properties: {
                    permission: { type: "string" },
                    allowed: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Permission updated." },
            403: { description: "Forbidden." },
          },
        },
      },
      "/api/workspaces/{workspaceId}/export": {
        get: {
          summary: "Export workspace data as CSV",
          tags: ["Workspaces"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "CSV file." },
            403: { description: "Forbidden." },
          },
        },
      },

      /* ── Goals ────────────────────────────────────────── */
      "/api/workspaces/{workspaceId}/goals": {
        get: {
          summary: "List goals in a workspace",
          tags: ["Goals"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "Goal list." } },
        },
        post: {
          summary: "Create a goal",
          tags: ["Goals"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    dueDate: { type: "string", format: "date-time" },
                    status: {
                      type: "string",
                      enum: ["NOT_STARTED", "IN_PROGRESS", "AT_RISK", "COMPLETED", "ARCHIVED"],
                    },
                    ownerMembershipId: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Goal created." },
            400: { description: "Validation error." },
            403: { description: "Forbidden." },
          },
        },
      },
      "/api/goals/{goalId}": {
        get: {
          summary: "Get goal detail with milestones and updates",
          tags: ["Goals"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "goalId", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "Goal detail." } },
        },
      },
      "/api/goals/{goalId}/milestones": {
        post: {
          summary: "Add a milestone to a goal",
          tags: ["Goals"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "goalId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string" },
                    progressPercentage: { type: "integer" },
                    dueDate: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Milestone created." },
            400: { description: "Validation error." },
          },
        },
      },
      "/api/goals/{goalId}/updates": {
        post: {
          summary: "Post a progress update on a goal",
          tags: ["Goals"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "goalId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["content"],
                  properties: {
                    content: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Update posted." },
            400: { description: "Validation error." },
          },
        },
      },

      /* ── Announcements ────────────────────────────────── */
      "/api/workspaces/{workspaceId}/announcements": {
        get: {
          summary: "List announcements in a workspace",
          tags: ["Announcements"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "Announcement list (pinned first)." } },
        },
        post: {
          summary: "Publish an announcement (admin only)",
          tags: ["Announcements"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    pinned: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Announcement published." },
            403: { description: "Forbidden." },
          },
        },
      },
      "/api/announcements/{announcementId}": {
        patch: {
          summary: "Update an announcement (admin only)",
          tags: ["Announcements"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "announcementId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    pinned: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Announcement updated." },
            403: { description: "Forbidden." },
          },
        },
      },
      "/api/announcements/{announcementId}/comments": {
        post: {
          summary: "Comment on an announcement",
          tags: ["Announcements"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "announcementId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["content"],
                  properties: {
                    content: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Comment created. @mention notifications triggered if applicable." },
            400: { description: "Validation error." },
          },
        },
      },
      "/api/announcements/{announcementId}/reactions": {
        post: {
          summary: "Toggle a reaction on an announcement",
          tags: ["Announcements"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "announcementId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["emoji"],
                  properties: {
                    emoji: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Reaction toggled." },
            400: { description: "Emoji required." },
          },
        },
      },
      "/api/announcements/{announcementId}/attachments": {
        post: {
          summary: "Upload a file attachment to an announcement",
          tags: ["Announcements"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "announcementId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["file"],
                  properties: {
                    file: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Attachment uploaded." },
            503: { description: "Cloudinary not configured." },
          },
        },
      },

      /* ── Action Items ─────────────────────────────────── */
      "/api/workspaces/{workspaceId}/action-items": {
        get: {
          summary: "List action items in a workspace",
          tags: ["Action Items"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "Action item list." } },
        },
        post: {
          summary: "Create an action item",
          tags: ["Action Items"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title"],
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"],
                    },
                    priority: {
                      type: "string",
                      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
                    },
                    dueDate: { type: "string", format: "date-time" },
                    goalId: { type: "string" },
                    assigneeMembershipId: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Action item created." },
            400: { description: "Validation error." },
            403: { description: "Forbidden." },
          },
        },
      },
      "/api/action-items/{actionItemId}": {
        patch: {
          summary: "Update an action item",
          tags: ["Action Items"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "actionItemId", required: true, schema: { type: "string" } },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    status: { type: "string" },
                    priority: { type: "string" },
                    dueDate: { type: "string", format: "date-time" },
                    goalId: { type: "string" },
                    assigneeMembershipId: { type: "string" },
                    position: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Action item updated." },
            403: { description: "Forbidden." },
            404: { description: "Not found." },
          },
        },
      },

      /* ── Analytics ────────────────────────────────────── */
      "/api/workspaces/{workspaceId}/analytics": {
        get: {
          summary: "Get workspace analytics",
          tags: ["Analytics"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Dashboard stats and goal completion data.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      stats: {
                        type: "object",
                        properties: {
                          totalGoals: { type: "integer" },
                          itemsCompletedThisWeek: { type: "integer" },
                          overdueCount: { type: "integer" },
                        },
                      },
                      goalCompletion: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            goalId: { type: "string" },
                            name: { type: "string" },
                            progress: { type: "integer" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      /* ── Notifications ────────────────────────────────── */
      "/api/workspaces/{workspaceId}/notifications": {
        get: {
          summary: "List notifications for the current user in a workspace",
          tags: ["Notifications"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          responses: { 200: { description: "Notification list." } },
        },
      },

      /* ── Audit Log ────────────────────────────────────── */
      "/api/workspaces/{workspaceId}/audit-events": {
        get: {
          summary: "List audit events for a workspace (admin only by default)",
          tags: ["Audit"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "Audit event list." },
            403: { description: "Forbidden." },
          },
        },
      },
      "/api/workspaces/{workspaceId}/audit-events/export": {
        get: {
          summary: "Export audit events as CSV (admin only by default)",
          tags: ["Audit"],
          security: [{ cookieAuth: [] }],
          parameters: [
            { in: "path", name: "workspaceId", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "CSV file." },
            403: { description: "Forbidden." },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "notfredohub_access_token",
          description: "JWT access token set as httpOnly cookie after login.",
        },
      },
    },
  },
  apis: [],
});

module.exports = { specification };
