const express = require("express");
const router = express.Router();
const { verify } = require("../utils/verifySignature");
const Transaction = require("../models/Transaction");

// ✅ POST: Verify and save signature
router.post("/verify", async (req, res) => {
  const { txId, user, signature } = req.body;

  try {
    const isValid = verify(user, txId, signature);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid Signature" });
    }

    await Transaction.create({ txId, user, signature });
    return res.json({ success: true, message: "Verified and stored successfully" });
  } catch (err) {
    console.error("❌ Verification failed:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// ✅ GET: Fetch transaction history for user
router.get("/history/:user", async (req, res) => {
  try {
    const txs = await Transaction.find({ user: req.params.user }).sort({ timestamp: -1 });
    return res.json(txs);
  } catch (err) {
    console.error("❌ History fetch error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
