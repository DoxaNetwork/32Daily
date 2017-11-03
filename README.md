# Toasty
Toasty network

To get started after installing necessary libraries (testrpc, npm, truffle, metamask, <anything else?>)

1. Start ethereum test blockchain (using testrpc)

`testrpc -s 1`

2. Compile contracts

`truffle compile`

3. Deploy contracts to blockchain

`truffle deploy`

4. Start server

`npm run start`

5. Initialize metamask

- open metamask and paste in the seed phrase from `testrpc`. (we use the `-s 1` flag) to keep this seed constant
- choose `localhost 8545` as the network from the top left dropdown in metamask
