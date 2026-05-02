const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^ogl$": "<rootDir>/src/__mocks__/ogl.js",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!(ogl|gsap|motion|sonner|cmdk|next-themes)/)",
  ],
};

module.exports = createJestConfig(customJestConfig);
