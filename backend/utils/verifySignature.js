const { ethers } = require("ethers");

function getPrefixedMessageHash(user, txId) {
  const messageHash = ethers.utils.solidityKeccak256(["address", "string"], [user, txId]);
  const messageHashBinary = ethers.utils.arrayify(messageHash);
  const prefixedHash = ethers.utils.hashMessage(messageHashBinary);
  return { messageHash, prefixedHash };
}

function verify(user, txId, signature) {
  const { prefixedHash } = getPrefixedMessageHash(user, txId);
  const recoveredAddress = ethers.utils.verifyMessage(ethers.utils.arrayify(ethers.utils.solidityKeccak256(["address", "string"], [user, txId])), signature);
  return recoveredAddress.toLowerCase() === user.toLowerCase();
}

module.exports = { verify };
