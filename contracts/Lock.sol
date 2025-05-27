// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TransactionAuthorization {
    address public owner;

    event TransactionApproved(address indexed user, string txId);

    constructor() {
        owner = msg.sender;
    }

    function approveTransaction(string memory txId, bytes memory signature) public {
        bytes32 messageHash = getPrefixedMessageHash(txId, msg.sender);
        require(recoverSigner(messageHash, signature) == msg.sender, "Invalid signature");
        emit TransactionApproved(msg.sender, txId);
    }

    function getPrefixedMessageHash(string memory txId, address user) internal pure returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(user, txId));
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function recoverSigner(bytes32 messageHash, bytes memory sig) internal pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);
        return ecrecover(messageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }
}
