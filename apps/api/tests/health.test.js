const request = require("supertest");

const { app } = require("../src/app");

describe("GET /api/health", () => {
  it("returns the API health payload", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.name).toBe("FredoHub API");
    expect(typeof response.body.timestamp).toBe("string");
  });
});
