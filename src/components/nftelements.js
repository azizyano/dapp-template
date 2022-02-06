import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import NFT from "../artifacts/contracts/LittleAlchemy.json"
import Market from '../artifacts/contracts/NFTMarket.json'
import Modal from 'react-modal';
import Select from 'react-select'

const nftaddress = "0xbE9a81fE76f98cdca8aDB5eb8beaD0c4dd55D5e7"
const nftmarketaddress = "0x7909eA2c2a0BaAE7b89976a80E807E5e0c33Ea1A";
const mintcontract = "0xbE9a81fE76f98cdca8aDB5eb8beaD0c4dd55D5e7"
const imag = ['./imgs/water.png', './imgs/air.png', './imgs/fire.png', './imgs/earth.png', './imgs/steam.png', './imgs/energy.png',
  './imgs/lava.png', './imgs/rain.png', './imgs/mud.png', './imgs/plant.png', './imgs/rock.png', './imgs/sand.png', './imgs/metal.png',
  './imgs/glass.png', './imgs/swamp.png', './imgs/eyeglasse.png', './imgs/electricity.png', './imgs/life.png', './imgs/human.png',
  './imgs/nerd.png', './imgs/computer.png', './imgs/internet.png', './imgs/blockchain.png', './imgs/Bitcoin.png']

export default function MyAssets() {
  const [NftBanalce, setNftBanalce] = useState([])
  const [imgsource, setimgsource] = useState([]);
  const [balanceArray, setBalanceArray] = useState([0]);
  const [isShowModalSell, setIsShowModalSell] = useState(false);
  const [allowMarket, setAllowanceMarket] = useState()
  const [amount, setAmount] = useState('0')
  const [account, setAccount] = useState();
  const [tokenBal, setTokenBal] = useState([])
  const [TokenValue, setTokenValue] = useState([])
  const [chainId, setChainId] = useState();
  useEffect(() => {
    myElements()
  }, [])
  async function allowance() {

    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract = new ethers.Contract(nftaddress, NFT.abi, signer)
      const value = await contract.isApprovedForAll(account, nftmarketaddress)
      const amount = value.toString()
      console.log(amount)
      if (amount === 'false') {
        setAllowanceMarket(false)
      } else {
        setAllowanceMarket(true)
      }
    } else {
      alert('No wallet is connected')
    }
  }
  async function approuveMarket() {
    console.log(allowMarket)
    if (account) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const address = nftmarketaddress.toString()
      const contract = new ethers.Contract(nftaddress, NFT.abi, signer)
      let transaction = await contract.setApprovalForAll(address, true)
      await transaction.wait()
      setAllowanceMarket(true)
    } else {
      alert('No wallet is connected')
    }
  }

  const changeAmount = ({ target }) => {
    setAmount(target.value)
  }
  async function createSale(tokenId) {

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const price = ethers.utils.parseUnits(amount, 'ether')
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    let transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    setIsShowModalSell(false)
    myElements()

  }

  async function myElements() {
    const test = await window.ethereum.on("chainChanged", (chainId) =>
      setChainId(chainId)

    );
    const chainId = parseInt(test.chainId.toString(16), 16);
    setChainId(chainId)
    if (chainId === 588) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner()
      const contract2 = new ethers.Contract(mintcontract, NFT.abi, signer)
      const account = await signer.getAddress()
      setAccount(account)

      if (account) {
        const ownerAddress = [account, account, account, account, account, account, account, account, account, account, account, account, account, account,
          account, account, account, account, account, account, account, account, account, account]
        const ownerIds = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]

        const balanceArray = await contract2.balanceOfBatch(ownerAddress, ownerIds);
        setBalanceArray(balanceArray);
        console.log(balanceArray.toString())
        if (balanceArray != null) {
          setimgsource([])
          for (let index = 0; index < balanceArray.length; index++) {
            if (balanceArray[index].toString() !== '0') {
              setimgsource(imgsource => [...imgsource, imag[index]])
              setNftBanalce(NftBanalce => [...NftBanalce, balanceArray[index].toString()])
            }
          }
          var tokenBal = [];
          for (let index = 0; index < balanceArray.length; index++) {
            if (balanceArray[index].toString() !== '0') {
              tokenBal.push({ label: index, value: index })
            }
          }
          setTokenBal(tokenBal)
        } else {
          alert('You need to mint your first element')
        }
      } else {
        console.log('You need to mint your first element')
      }
    } else {
      console.log('network error')
    }
  }
  return (

    <div className="">
      {chainId === 588 ? (
        <>
              <div className="account">
              <div className="">
              <label onClick={() => myElements()} className="remarks">NFT balance</label>
              </div>
                {
                  imgsource.map((image, index) => {
                    return (
                      <div key={image} className={"gallery"}>
                        <img key={index} src={imgsource[index]} alt="" />
                        <br />
                        <label className="remarksId"> balance : {NftBanalce[index]}</label>
                      </div>
        
                    )
                  })
                }
              <div className="">
              <button onClick={() => allowance() && setIsShowModalSell(true)}>Sell my NFT </button>
              </div>
               
                
              </div>
              <Modal
                isOpen={isShowModalSell}
                ariaHideApp={false}
                onRequestClose={() => setIsShowModalSell(false)}>
                <div className="modal-header">
                <h4>SELL NFT </h4>
                  <label onClick={() => setIsShowModalSell(false)}>x</label>
                </div>
                {allowMarket
                  ? <div className={`card`}>
                    <div className="card input">
        
                      <h4>NFT </h4>
                      <Select
                      
                        options={tokenBal}
                        value={TokenValue}
                        onChange={setTokenValue}
                        defaultValue={{ label: 0, value: '0' }}
                      />
        
                    </div>
                    
                    <img alt='' src={imag[TokenValue.value]} className='logo'/>
                    
                    
                    <div className="card input">
                      <h4>For a Price </h4>
                      <input
                        value={amount}
                        onChange={changeAmount}
                        placeholder={amount}
                        className="form-control"
                      />
                    </div>
                    <button onClick={() => createSale(TokenValue.value)}>Sell NFT </button>
                  </div>
        
                  : <div className={`card `}>
                    <button onClick={() => approuveMarket()}>approuve  </button>
                  </div>
                }
              </Modal>
              </>
      ): (
        <div className={`card`}></div>
      )
      }

    </div>
  )
}
