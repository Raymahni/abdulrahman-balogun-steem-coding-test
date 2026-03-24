function validateItem(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    return ["Invalid payload"];
  }

  if (
    !payload.name ||
    typeof payload.name !== "string" ||
    !payload.name.trim()
  ) {
    errors.push("Name is required and must be a non-empty string");
  }

  if (
    !payload.category ||
    typeof payload.category !== "string" ||
    !payload.category.trim()
  ) {
    errors.push("Category is required and must be a non-empty string");
  }

  if (
    payload.price === undefined ||
    typeof payload.price !== "number" ||
    payload.price <= 0
  ) {
    errors.push("Price is required and must be a positive number");
  }

  return errors;
}

module.exports = { validateItem };
