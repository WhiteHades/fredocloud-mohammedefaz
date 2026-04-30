const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const { config } = require("./env");

const globalForPrisma = global;

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: config.databaseUrl });

  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.__fredohubPrisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__fredohubPrisma = prisma;
}

module.exports = { prisma };
