function sanitize(text) {
  return text.replace(/[^\w-]/g, "").toLowerCase();
}

module.exports = sanitize;
