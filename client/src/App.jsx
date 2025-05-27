import { useState } from "react";
import { getContract } from "./utils/contractInteract";
import { ethers } from "ethers";

function App() {
  const [txId, setTxId] = useState("");
  const [account, setAccount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    }
  };

  const signAndApproveTx = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const messageHash = ethers.utils.solidityKeccak256(["address", "string"], [account, txId]);
      const prefixedHash = ethers.utils.hashMessage(ethers.utils.arrayify(messageHash));
      const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

      const contract = getContract();
      const tx = await contract.approveTransaction(txId, signature);
      await tx.wait();

      alert("✅ Transaction approved via signature!");
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>🛡️ Blockchain OTP Replacement</h2>
      <button onClick={connectWallet}>
        {account ? `🔗 Connected: ${account}` : "Connect Wallet"}
      </button>
      <br /><br />
      <input
        type="text"
        placeholder="Transaction ID"
        onChange={e => setTxId(e.target.value)}
        style={{ width: "300px", padding: "8px" }}
      />
      <br /><br />
      <button onClick={signAndApproveTx} style={{ padding: "10px 20px" }}>
        ✅ Authorize Transaction
      </button>
    </div>
  );
}

export default App;
