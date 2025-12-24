function validateLead(body) {
  const errors = [];

  // First Name
  if (!body.first_name || body.first_name.trim() === "") {
    errors.push("First name is required");
  }

  // Last Name
  if (!body.last_name || body.last_name.trim() === "") {
    errors.push("Last name is required");
  }

  // Email
  if (!body.email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      errors.push("Invalid email format");
    }
  }

  // Phone (optional but validated if present)
  if (body.phone && !/^\d{10}$/.test(body.phone)) {
    errors.push("Phone must be 10 digits");
  }

  return errors;
}

module.exports = validateLead;
