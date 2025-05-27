const mongoose = require("mongoose");

const TxSchema = new mongoose.Schema({
  txId: String,
  user: String,
  signature: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", TxSchema);
