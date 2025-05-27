import { useState } from "react";
import { getContract } from "./utils/contractInteract";
import { ethers } from "ethers";
import axios from "axios";  // <-- Add this import

function App() {
  const [txId, setTxId] = useState("");
  const [account, setAccount] = useState("");
  const [history, setHistory] = useState([]); // <-- Add history state

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/auth/history/${account}`);
      setHistory(res.data);
    } catch (err) {
      alert("Error fetching history: " + err.message);
    }
  };

  const signAndApproveTx = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const messageHash = ethers.utils.solidityKeccak256(["address", "string"], [account, txId]);
      const signature = await signer.signMessage(ethers.utils.arrayify(messageHash));

      // Verify signature locally matches wallet
      const recovered = ethers.utils.verifyMessage(ethers.utils.arrayify(messageHash), signature);
      if (recovered.toLowerCase() !== account.toLowerCase()) {
        throw new Error("Signature does not match the connected wallet");
      }

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

      <br /><br />
      <button onClick={fetchHistory} style={{ padding: "10px 20px" }} disabled={!account}>
        📜 Fetch My History
      </button>

      <ul style={{ marginTop: "20px" }}>
        {history.map((tx, index) => (
          <li key={index}>
            <strong>{tx.txId}</strong> - {new Date(tx.timestamp).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
