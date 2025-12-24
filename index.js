require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const getAccessToken = require("./zohoAuth");

const app = express();
app.use(bodyParser.json());

/**
 * ===========================
 * 🔐 VALIDATION FUNCTION
 * ===========================
 */
function validateLead(body) {
  const errors = [];

  if (!body.first_name || body.first_name.trim() === "") {
    errors.push("First name is required");
  }

  if (!body.last_name || body.last_name.trim() === "") {
    errors.push("Last name is required");
  }

  if (!body.email) {
    errors.push("Email is required");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      errors.push("Invalid email format");
    }
  }

  if (body.phone && !/^\d{10}$/.test(body.phone)) {
    errors.push("Phone must be 10 digits");
  }

  return errors;
}

// ===========================
// 1️⃣ CREATE LEAD + ADD NOTE
// ===========================
app.post("/create-lead", async (req, res) => {
  // ✅ VALIDATION CHECK
  const errors = validateLead(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  try {
    const token = await getAccessToken();

    // CREATE LEAD
    const leadRes = await axios.post(
      `${process.env.ZOHO_API}/crm/v2/Leads`,
      {
        data: [
          {
            Company: req.body.company || "Demo Company",
            Last_Name: req.body.last_name,
            First_Name: req.body.first_name,
            Phone: req.body.phone,
            Email: req.body.email,
            Lead_Source: req.body.lead_source || "Website"
          }
        ]
      },
      {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      }
    );

    const leadId = leadRes.data.data[0].details.id;

    // ADD NOTE TO LEAD
    await axios.post(
      `${process.env.ZOHO_API}/crm/v2/Notes`,
      {
        data: [
          {
            Note_Title: "Lead Note (API)",
            Note_Content:
              req.body.note ||
              "Lead created via API and note added automatically.",
            Parent_Id: leadId,
            se_module: "Leads"
          }
        ]
      },
      {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      }
    );

    res.json({
      success: true,
      message: "Lead created & note added successfully",
      leadId
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
});

// ===========================
// 2️⃣ UPDATE LEAD STATUS
// ===========================
app.put("/update-lead-status", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { leadId, status } = req.body;

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "leadId is required"
      });
    }

    await axios.put(
      `${process.env.ZOHO_API}/crm/v2/Leads`,
      {
        data: [
          {
            id: leadId,
            Lead_Status: status || "Contacted"
          }
        ]
      },
      {
        headers: { Authorization: `Zoho-oauthtoken ${token}` }
      }
    );

    res.json({
      success: true,
      message: "Lead status updated successfully",
      leadId
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json(err.response?.data || err.message);
  }
});

// ===========================
// START SERVER
// ===========================
app.listen(3000, () =>
  console.log("Zoho Suite Demo backend running on port 3000")
);
