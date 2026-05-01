const swaggerJsdoc = require("swagger-jsdoc");

const specification = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "notFredoHub API",
      version: "0.1.0",
      description: "Collaborative team hub API for authentication, workspaces, planning, broadcast, and analytics.",
    },
    servers: [
      {
        url: process.env.CLIENT_URL || "http://localhost:4000",
      },
    ],
    paths: {
      "/api/health": {
        get: {
          summary: "Health check",
          responses: { 200: { description: "API is healthy." } },
        },
      },
      "/api/auth/register": {
        post: {
          summary: "Register a user",
          responses: { 201: { description: "Registered successfully." } },
        },
      },
      "/api/auth/login": {
        post: {
          summary: "Log in a user",
          responses: { 200: { description: "Logged in successfully." } },
        },
      },
      "/api/workspaces": {
        get: {
          summary: "List memberships for the signed-in user",
          responses: { 200: { description: "Membership list." } },
        },
        post: {
          summary: "Create a workspace",
          responses: { 201: { description: "Workspace created." } },
        },
      },
      "/api/workspaces/{workspaceId}/analytics": {
        get: {
          summary: "Get workspace analytics",
          parameters: [
            {
              in: "path",
              name: "workspaceId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: { 200: { description: "Analytics payload." } },
        },
      },
    },
  },
  apis: [],
});

module.exports = { specification };
