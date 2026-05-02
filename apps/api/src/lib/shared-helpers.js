function parseDateString(value) {
  if (!value) {
    return "";
  }
  return value instanceof Date ? value.toISOString() : String(value);
}

function parseDateValue(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function toCsvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

module.exports = {
  parseDateString,
  parseDateValue,
  toCsvCell,
  normalizeEmail,
};
