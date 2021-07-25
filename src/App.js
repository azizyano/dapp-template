import { useState, useEffect } from 'react'
import './App.scss';
import { ethers } from 'ethers'
import { providers } from "ethers";
import Container from 'react-bootstrap/Container';
import Modal from 'react-modal';
import { FiRefreshCw } from "react-icons/fi";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Transaction from './artifacts/contracts/Transaction.sol/Transaction.json'

const contractAddress = "PASTE_YOUR_CONTRACT_ADDRESS_HERE"

function App() {
  const [account, setAccount] = useState();
  const [contractAmount, setContractAmount] = useState(0);
  const [isShowModalWallet, setIsShowModalWallet] = useState(false);
  const [currentWallet, setCurrentWallet] = useState();

  // Connect Wallet
  async function connectWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    setAccount(accounts[0])
    setIsShowModalWallet(false)
    setCurrentWallet('metamask')
  }

  // Connect MatchWallet
  async function connectMathWallet() {
    try {
      const account = await window.harmony.getAccount();
      setAccount(account.address)
      setIsShowModalWallet(false)
      setCurrentWallet('mathwallet')
    } catch {
      alert('Please login MathWallet')
    }
  }

  // Connect WalletConnect
  async function connectWalletConnect() {
    const walletConnectProvider = new WalletConnectProvider({
      infuraId: "PASTE_INFURA_ID_HERE"
    });

    try {
      await walletConnectProvider.enable();
      const provider = new providers.Web3Provider(walletConnectProvider);
      const signer = provider.getSigner();
      setAccount(await signer.getAddress())
      setIsShowModalWallet(false)
      setCurrentWallet('walletconnect')
    } catch {
      setIsShowModalWallet(false)
    }
  }

  async function sendCoin() {
    if (!account) {
      alert('No wallet is connected')
    } else {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, Transaction.abi, signer)

        let tx = {
          value: ethers.utils.parseEther("1")
        };

        const transaction = await contract.addMoney(tx)
        await transaction.wait()
    }
  }

  async function getContractAmount() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, Transaction.abi, signer)
    const contractAmount = await contract.getMoneyStored()

    setContractAmount(ethers.utils.formatEther(contractAmount))
  }

  useEffect(() => {
  }, [])

  return (
    <>
      <div className="header">
        <img src="images/logo.png" className="logo" alt="" />
        {account
          ? <button className="btn-connect-wallet" onClick={() => setIsShowModalWallet(true)}>{account}</button>
          : <button onClick={() => setIsShowModalWallet(true)}>Connect Wallet</button>
        }
      </div>

      <Container className="container-small">
        <h1>Harmony</h1>
        <div className={`card swap-card`}>
          <label>Enter Send Amount</label>
          <div className="input-swap-container">
            <div className="selected-coin"><img src="/images/one.png" alt="" /><span>ONE</span></div>
            <input placeholder="0.00" />
          </div>
          <button onClick={sendCoin}>Send</button>
        </div>
        <div className="sending-line"></div>
        <div className={`card card-receive`}>
          <div>
            <label>Contract Amount</label>
            <h2>{contractAmount}</h2>
          </div>
          <div className="icon-box">
            <img src="/images/one.png" alt="" />
          </div>
        </div>
        <label onClick={getContractAmount} className="remarks">click <FiRefreshCw /> to refresh the contract amount</label>
      </Container>

      <Modal
        isOpen={isShowModalWallet}
        ariaHideApp={false}
        onRequestClose={() => setIsShowModalWallet(false)}
      >
        <div className="modal-header">
          <h3>Select wallet to connect</h3>
          <label onClick={() => setIsShowModalWallet(false)}>x</label>
        </div>
        <div className="modal-content">
          <button onClick={connectWallet}>Metamask<img src="/images/metamask-logo.png" alt="" /></button>
          <button onClick={connectMathWallet}>MathWallet<img src="/images/mathwallet-logo.png" alt="" /></button>
          <button onClick={connectWalletConnect}>WalletConnect<img src="/images/walletconnect-logo.png" alt="" /></button>
        </div>
      </Modal>
    </>
  );
}

export default App;
