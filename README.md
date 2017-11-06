# Toasty
Toasty network

To get started, you can follow these instructions.  Please reach out to make any changes or clear up any bullet points.

To get started, install the libraries: testrpc, npm, truffle, metamask

0. Install third-party software

- npm - Install [NodeJS](https://nodejs.org/en/)
- testrpc - https://github.com/ethereumjs/testrpc
   
    `npm install -g ethereumjs-testrpc`

- truffle - https://github.com/trufflesuite/truffle

    `npm install -g truffle`

- MetaMask - This is is Chrome Extension - https://metamask.io/

1. Start ethereum test blockchain using testrpc

    `testrpc -s 1`

2. install npm dependencies. Run each command from here on out in the root folder for the application (..\Truffle)

    `npm install`

3. Compile contracts

    `truffle compile`

4. Deploy contracts to blockchain

    `truffle deploy`

5. Start server. 

    `npm run start`

6. Initialize metamask

- Copy the mnemonic from `testrpc`. We use the `-s 1` flag to keep this seed constant.
- Click the upper-right menu, select `Lock`, select `Restore from seed phrase` and paste the mnemonic.  You can use whatever password you want here.
- Lastly, choose `localhost 8545` as the network from the top left dropdown in metamask
