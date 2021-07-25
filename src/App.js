import { useState, useEffect } from 'react'
import './App.scss';
import { ethers } from 'ethers'
import { providers } from "ethers";
import Container from 'react-bootstrap/Container';
import Modal from 'react-modal';
import { FiRefreshCw } from "react-icons/fi";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Transaction from './artifacts/contracts/Transaction.sol/Transaction.json'

const contractAddress = "0xFEe5a81D578521b55DF7C85c9Ca3F6bE59B96787"

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
      infuraId: "9def0e13675545d29c4e21b210e99f54"
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

      if (currentWallet === 'metamask') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, Transaction.abi, signer)

        let tx = {
          value: ethers.utils.parseEther("1")
        };

        const transaction = await contract.addMoney(tx)
        await transaction.wait()

      } else {
        const provider = new ethers.providers.Web3Provider(window.harmony);
        // const signer = provider.getSigner()
        // const contract = new ethers.Contract(contractAddress, Transaction.abi, signer)
        // let tx = {
        //   value: ethers.utils.parseEther("1")
        // };

        // const transaction = await contract.addMoney(tx)
        // await transaction.wait()

        
        // let tx = {
        //   value: ethers.utils.parseEther("1")
        // };
        // const txn = harmony.transactions.newTx(txnObject, true);
        // const signer = await window.harmony.signTransaction(txn);
      }

    }
  }

  async function getContractAmount() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, Transaction.abi, signer)
    const contractAmount = await contract.getMoneyStored()

    setContractAmount(ethers.utils.formatEther(contractAmount))
  }

  async function getAccountBalance() {
    // const provider = new ethers.providers.Web3Provider(window.ethereum)
    // const signer = provider.getSigner()
    // let account = await signer.getAddress()

    // setAddress(await getAccountAddress())
    // console.log(address)
    // const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner()
    // console.log(await signer.getBalance(account))
    // let roundedBalance = ethers.utils.formatEther(await provider.getBalance(account))
    // roundedBalance = (+roundedBalance).toFixed(4)
    // setBalance(roundedBalance)

    // console.log(roundedBalance)
  }

  // call the smart contract, read the current greeting value
  // async function fetchGreeting() {
  //   if (typeof window.ethereum !== 'undefined') {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum)
  //     const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider)
  //     try {
  //       const data = await contract.greet()
  //       console.log('data: ', data)
  //     } catch (err) {
  //       console.log("Error: ", err)
  //     }
  //   }
  // }

  // call the smart contract, send an update
  // async function setGreeting() {
  //   if (!greeting) return
  //   if (typeof window.ethereum !== 'undefined') {
  //     await requestAccount()
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const signer = provider.getSigner()
  //     const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer)
  //     const transaction = await contract.setGreeting(greeting)
  //     await transaction.wait()
  //     fetchGreeting()
  //   }
  // }

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
