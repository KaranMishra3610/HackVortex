const {
  solidityPacked,
  keccak256,
  verifyMessage,
  getBytes,
} = require("ethers");

function verify(user, txId, signature) {
  // Create the hash from packed data
  const packed = solidityPacked(["address", "string"], [user, txId]);
  const hash = keccak256(packed);

  // Recover the address
  const recovered = verifyMessage(getBytes(hash), signature);

  // Match with the expected user address
  return recovered.toLowerCase() === user.toLowerCase();
}

module.exports = { verify };
