import { useState } from "react";
import { getContract } from "./utils/contractInteract";
import { ethers } from "ethers";
import axios from "axios";
import './App.css';

function App() {
  const [txId, setTxId] = useState("");
  const [account, setAccount] = useState("");
  const [history, setHistory] = useState([]);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("🦊 Please install MetaMask to use this feature.");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      fetchHistory(accounts[0]);
    } catch (err) {
      alert("❌ Wallet connection failed: " + err.message);
    }
  };

  const fetchHistory = async (userAddr = account) => {
    try {
      if (!userAddr) return;
      const res = await axios.get(`http://localhost:5000/api/auth/history/${userAddr}`);
      setHistory(res.data);
    } catch (err) {
      alert("❌ Error fetching history: " + err.message);
    }
  };

  const signAndApproveTx = async () => {
    try {
      if (!window.ethereum) throw new Error("🦊 MetaMask not found. Please install MetaMask!");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const encoded = ethers.solidityPacked(["address", "string"], [account, txId]);
      const hash = ethers.keccak256(encoded);
      const signature = await signer.signMessage(ethers.getBytes(hash));

      const recovered = ethers.verifyMessage(ethers.getBytes(hash), signature);
      if (recovered.toLowerCase() !== account.toLowerCase()) {
        throw new Error("Signature does not match the connected wallet");
      }

      const contract = await getContract();
      const tx = await contract.approveTransaction(txId, signature);
      await tx.wait();

      await axios.post("http://localhost:5000/api/auth/verify", {
        txId,
        user: account,
        signature
      });

      alert("✅ Transaction approved and saved to database!");
      fetchHistory();
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div className="container">
      <div className="card fade-in">
        <h1>🔐 Blockchain OTP Replacement</h1>
        <button className="button connect-btn" onClick={connectWallet}>
          {account ? `🔗 ${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
        </button>
        <input
          className="input"
          type="text"
          placeholder="Enter Transaction ID"
          onChange={e => setTxId(e.target.value)}
        />
        <button className="button approve-btn" onClick={signAndApproveTx} disabled={!account || !txId}>
          ✅ Authorize Transaction
        </button>
        <button className="button history-btn" onClick={fetchHistory} disabled={!account}>
          📜 View History
        </button>
      </div>

      {history.length > 0 && (
        <div className="card fade-in">
          <h3>📂 Authorization History</h3>
          <ul className="history-list">
            {history.map((tx, index) => (
              <li key={index}>
                <strong>{tx.txId}</strong><br />
                <span>
                  {new Date(tx.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
