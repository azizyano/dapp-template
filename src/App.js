import React, { useEffect, useState } from "react";
import "./App.scss";
import { ethers } from "ethers";
import { providers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import NFT from "./artifacts/contracts/LittleAlchemy.json";
import Container from "react-bootstrap/Container";
import Modal from "react-modal";
import axios from "axios";
import MyAssets from "./components/nftelements";
import Transaction from "./artifacts/contracts/Transaction.sol/Transaction.json";
import Market from "./artifacts/contracts/NFTMarket.json";
const nftaddress = "0xbE9a81fE76f98cdca8aDB5eb8beaD0c4dd55D5e7";
const nftmarketaddress = "0x7909eA2c2a0BaAE7b89976a80E807E5e0c33Ea1A";

function App() {
  const [account, setAccount] = useState();
  const [isShowModalWallet, setIsShowModalWallet] = useState(false);
  const [msg, setMsg] = useState("...");
  const [currentWallet, setCurrentWallet] = useState();
  const [chainId, setChainId] = useState();
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [metisBalance, setmetisBalance] = useState(0);

  useEffect(() => {

    

  }, [])
  function isMetaMaskInstalled() {
    //Have to check the ethereum binding on the window object to see if it's installed
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
  }
  async function accountInfo(){
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      let metisBalance = await provider.getBalance(accounts[0])
      metisBalance = ethers.utils.formatEther(metisBalance)
      let chain = await window.ethereum.on("chainChanged", (chainId) =>
        setChainId(parseInt(chainId.toString(16), 16))
      );
      await window.ethereum.on("chainChanged", (chainId) =>
        setChainId(parseInt(chainId.toString(16), 16))
      );
  
      await window.ethereum.on('accountsChanged', (accounts) =>
        setAccount(accounts[0])
      );
      setChainId(parseInt(chain.chainId.toString(16), 16))
      setmetisBalance(parseFloat(metisBalance).toFixed(2))
      loadNFTs()
    }
  // Connect Wallet
  async function connectWallet() {
    if (!isMetaMaskInstalled()) {
      alert("you need Metamask to connect");
    } else {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
      setIsShowModalWallet(false);
      setCurrentWallet("metamask");
      accountInfo()
    }
  }
  async function SwitchNetwork() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x24c" }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x24c",
                rpcUrl: "https://stardust.metis.io/?owner=588" /* ... */,
              },
            ],
          });
        } catch (addError) { }
      }
    }
    accountInfo()
    loadNFTs()
  }
  // Connect MatchWallet
  async function connectMathWallet() {
    try {
      const account = await window.harmony.getAccount();
      setAccount(account.address);
      setIsShowModalWallet(false);
      setCurrentWallet("mathwallet");
    } catch {
      alert("Please login MathWallet");
    }
  }

  // Connect WalletConnect
  async function connectWalletConnect() {
    const walletConnectProvider = new WalletConnectProvider({
      infuraId: "PASTE_INFURA_ID_HERE",
    });

    try {
      await walletConnectProvider.enable();
      const provider = new providers.Web3Provider(walletConnectProvider);
      const signer = provider.getSigner();
      setAccount(await signer.getAddress());
      setIsShowModalWallet(false);
      setCurrentWallet("walletconnect");
    } catch {
      setIsShowModalWallet(false);
    }
  }
  async function buyNft(nft) {
    console.log(chainId)
    if (chainId === 588) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
      console.log("buy for :" + price.toString(), 'this toktn id; ' + nft.tokenId)
      const transaction = await marketContract.createMarketSale(nftaddress, nft.itemId, {
        value: price.toString()
      })
      await transaction.wait()
      loadNFTs()
    } else {
      console.log('network error')
    }

  }
  async function loadNFTs() {
    if (chainId === 588 ){
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const data = await marketContract.fetchMarketItems();
      console.log(data);
      const items = await Promise.all(
        data.map(async (i) => {
          let tokenUri = await tokenContract.uri(i.tokenId);
          tokenUri = tokenUri.replace("{id}", i.tokenId);
          let meta = await axios.get(tokenUri);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            itemId: i.itemId.toNumber(),
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
          };
          return item;
        })
      );
      setNfts(items);
      setLoadingState("loaded");
    } else {
      console.log('network error')
    }

   
  }

  return (
    <>
      <div className="header">
        <img src="images/logo.png" className="logo" alt="" />
        <label onClick={() => loadNFTs()} className="remarks_price">
          Refresh
        </label>
        {account ? (
          <>
          <label className="remarks_price ">
          {'Balance ' + metisBalance + ' Metis '}
          </label>
          <button className="btn-connect-wallet" onClick={() => setIsShowModalWallet(true)}>
           {account}
          </button>
          </>
        ) : (
          <button onClick={() => setIsShowModalWallet(true)}>
            Connect Wallet
          </button>
        )}

      </div>

      <Container className="container">
     
      {account ? (chainId === 588 ? (
              <div className="clearfix">
                
               <div className="column menu">
                <MyAssets />
                </div>
                <div className="column content">
                <div className="market">
               {nfts.map((nft, i) => (
                 <div key={i} className="gallery">
                   <img src={nft.image} alt='' />
                   <div className="desc">{nft.price} Metis</div>
   
                   <button onClick={() => buyNft(nft)}>Buy</button>
   
                 </div>
   
               ))}
               </div>
             </div>
             </div>
      ):(
        <div className="">
              <h1> Network error  </h1>
              
              <button onClick={() => SwitchNetwork()}>Switch to metis testnet</button>
            </div>
      )

           ) : ( 
            <div className="">
              <h1> wallet not connacted </h1>
            </div>
          )}
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
          <button onClick={connectWallet}>
            Metamask
            <img src="/images/metamask-logo.png" alt="" />
          </button>
          <button onClick={connectMathWallet}>
            MathWallet
            <img src="/images/mathwallet-logo.png" alt="" />
          </button>
          <button onClick={connectWalletConnect}>
            WalletConnect
            <img src="/images/walletconnect-logo.png" alt="" />
          </button>
        </div>
      </Modal>
    </>
  );
}

export default App;
