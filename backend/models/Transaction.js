const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  txId: String,
  user: String,
  signature: String,
}, { timestamps: true }); // ✅ This adds createdAt and updatedAt

module.exports = mongoose.model("Transaction", transactionSchema);
