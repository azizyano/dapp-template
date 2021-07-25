# Harmony Dapp Template Beginner

1. npm install.
2. After npm install, setup Metamask wallet in your browser. The setup guide can follow via link [https://docs.harmony.one/home/network/wallets/browser-extensions-wallets/metamask-wallet].
3. Once you done setting up the Metamask wallet with Harmony Testnet, in the file `hardhat.config.js` replace the `HARMONY_PRIVATE_KEY` with your own Harmony private key. At the bottom of the file you will see network testnet with using this private key which mean the later contract transaction will link to this account.
4. Next, open node and run `npx hardhat run --network testnet scripts/deploy.js`, the testnet here is what we setup in the previous step. Once the command executed, you are suppose to see a line in node which mentioned contract deployed to which address, copy the address and go to `App.js`, paste the address to the line `PASTE_YOUR_CONTRACT_ADDRESS_HERE`
5. Everything should be work now, You are now test and play around with the template. 
