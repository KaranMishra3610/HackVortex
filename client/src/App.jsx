import { useState } from 'react';
import { getContract } from './utils/contractInteract';

function App() {
  const [txId, setTxId] = useState('');
  const [signature, setSignature] = useState('');
  const [account, setAccount] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    }
  };

  const approveTx = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.approveTransaction(txId, signature);
      await tx.wait();
      alert("Approved successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div>
      <h1>Transaction Authorization</h1>
      <button onClick={connectWallet}>
        {account ? `Connected: ${account}` : "Connect Wallet"}
      </button>
      <input placeholder="Transaction ID" onChange={e => setTxId(e.target.value)} />
      <input placeholder="Signature" onChange={e => setSignature(e.target.value)} />
      <button onClick={approveTx}>Approve</button>
    </div>
  );
}

export default App;
