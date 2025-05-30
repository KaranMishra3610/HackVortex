import { useState } from "react";
import { getContract } from "./utils/contractInteract";
import { ethers } from "ethers";
import axios from "axios";
import "./App.css";

function App() {
  const [txId, setTxId] = useState("");
  const [account, setAccount] = useState("");
  const [history, setHistory] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("🦊 Please install MetaMask to use this feature.");
        return;
      }
      setLoading(true);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      fetchHistory(accounts[0]);
    } catch (err) {
      alert("❌ Wallet connection failed: " + err.message);
    } finally {
      setLoading(false);
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

  const generateTxId = async () => {
    try {
      if (!account) return alert("🔗 Please connect your wallet first.");
      setGenerating(true);
      const res = await axios.post("http://localhost:5000/api/auth/generate", {
        user: account,
      });
      setTxId(res.data.txId);
    } catch (err) {
      alert("❌ TxID Generation Error: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const signAndApproveTx = async () => {
    try {
      if (!window.ethereum) throw new Error("🦊 MetaMask not found. Please install MetaMask!");

      setLoading(true);
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
        signature,
      });

      alert("✅ Transaction approved and saved to database!");
      setTxId("");
      fetchHistory();
    } catch (err) {
      alert("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyTxId = () => {
    if (txId) {
      navigator.clipboard.writeText(txId);
      alert("📋 TxID copied to clipboard!");
    }
  };

  return (
    <div className="wrapper">
      <div className="background-effects">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
      
      <div className="container">
        <div className="main-card slide-up">
          <div className="header-section">
            <div className="logo-container">
              <div className="logo-icon">🔐</div>
              <h1 className="title">SignChain</h1>
            </div>
            <p className="subtitle">Next-Generation Blockchain Authentication</p>
            <div className="status-indicator">
              <div className={`status-dot ${account ? 'connected' : 'disconnected'}`}></div>
              <span className="status-text">
                {account ? 'Wallet Connected' : 'Wallet Disconnected'}
              </span>
            </div>
          </div>

          <div className="wallet-section">
            <button 
              className={`btn connect-btn ${loading ? 'loading' : ''}`} 
              onClick={connectWallet}
              disabled={loading}
            >
              <span className="btn-icon">🔗</span>
              <span className="btn-text">
                {loading ? "Connecting..." : account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
              </span>
              {loading && <div className="spinner"></div>}
            </button>
          </div>

          <div className="action-section">
            <button 
              className={`btn generate-btn ${generating ? 'loading' : ''}`} 
              onClick={generateTxId} 
              disabled={!account || generating}
            >
              <span className="btn-icon">⚙️</span>
              <span className="btn-text">
                {generating ? "Generating..." : "Generate TxID"}
              </span>
              {generating && <div className="spinner"></div>}
            </button>

            <div className="input-container">
              <input
                className="input txid-input"
                type="text"
                value={txId}
                placeholder="Generated TxID will appear here..."
                readOnly
              />
              {txId && (
                <button className="copy-btn" onClick={copyTxId} title="Copy TxID">
                  📋
                </button>
              )}
            </div>

            <button 
              className={`btn approve-btn ${loading ? 'loading' : ''}`} 
              onClick={signAndApproveTx} 
              disabled={!account || !txId || loading}
            >
              <span className="btn-icon">✅</span>
              <span className="btn-text">Authorize Transaction</span>
              {loading && <div className="spinner"></div>}
            </button>

            <button 
              className="btn history-btn" 
              onClick={fetchHistory} 
              disabled={!account}
            >
              <span className="btn-icon">📜</span>
              <span className="btn-text">View History</span>
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="history-card slide-up">
            <div className="history-header">
              <h3 className="history-title">
                <span className="history-icon">📂</span>
                Authorization History
                <span className="history-count">({history.length})</span>
              </h3>
            </div>
            <div className="history-content">
              {history.map((tx, index) => (
                <div key={index} className="history-item">
                  <div className="history-item-header">
                    <span className="tx-badge">TX</span>
                    <strong className="tx-id">{tx.txId}</strong>
                  </div>
                  <div className="history-item-footer">
                    <span className="timestamp">
                      {new Date(tx.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                    <span className="status-badge success">Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;