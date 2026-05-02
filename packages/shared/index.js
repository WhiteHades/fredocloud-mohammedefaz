const APP_NAME = "notFredoHub";

const WORKSPACE_ROLES = {
  ADMIN: "ADMIN",
  MEMBER: "MEMBER",
};

/**
 * Parse a date-like value into an ISO string for CSV/display use.
 * Returns "" for falsy input.
 */
function parseDateString(value) {
  if (!value) {
    return "";
  }
  return value instanceof Date ? value.toISOString() : String(value);
}

/**
 * Parse a date-like value into a Date (or null) for Prisma writes.
 */
function parseDateValue(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

/**
 * Wrap a value for a CSV cell — escaping double quotes.
 */
function toCsvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

/**
 * Normalise an email address by trimming and lowercasing.
 */
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

module.exports = {
  APP_NAME,
  WORKSPACE_ROLES,
  parseDateString,
  parseDateValue,
  toCsvCell,
  normalizeEmail,
};
