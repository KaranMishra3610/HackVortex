const express = require("express");
const router = express.Router();
const { verify } = require("../utils/verifySignature");
const Transaction = require("../models/Transaction");

const crypto = require("crypto");

// ✅ POST: Securely generate txId
router.post("/generate", async (req, res) => {
  try {
    const { user } = req.body;
    const txId = crypto.randomBytes(16).toString("hex");

    await Transaction.create({ txId, user, status: "pending", createdAt: new Date() });

    return res.json({ success: true, txId });
  } catch (err) {
    console.error("❌ TxID generation failed:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});


// ✅ POST: Verify and save signature
router.post("/verify", async (req, res) => {
  const { txId, user, signature } = req.body;

  try {
    const tx = await Transaction.findOne({ txId });

    if (!tx) {
      return res.status(404).json({ success: false, message: "Transaction ID not found or expired" });
    }

    if (tx.user.toLowerCase() !== user.toLowerCase()) {
      return res.status(403).json({ success: false, message: "Transaction does not belong to user" });
    }

    if (tx.signature) {
      return res.status(400).json({ success: false, message: "Transaction already verified" });
    }

    const isValid = verify(user, txId, signature);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Invalid Signature" });
    }

    tx.signature = signature;
    tx.status = "approved";
    await tx.save();

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
