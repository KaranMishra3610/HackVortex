const express = require("express");
const router = express.Router();
const { verify } = require("../utils/verifySignature");
const Transaction = require("../models/Transaction");

// @route POST /api/auth/verify
router.post("/verify", async (req, res) => {
  const { txId, user, signature } = req.body;

  try {
    const isValid = verify(user, txId, signature);
    if (!isValid) return res.status(401).json({ success: false, message: "Invalid Signature" });

    // Save to DB
    await Transaction.create({ txId, user, signature });

    return res.json({ success: true, message: "Verified and stored successfully" });
  } catch (err) {
    console.error("Verification failed:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});
