var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "coffee rotate grocery flip prevent solution share column prevent autumn explain elevator";

module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8546,
      network_id: 9, // Match any network id
      gas: 4712388
    },
  	ropsten_infura:  {
        network_id: 3,
        // host: "localhost",
        port:  8545,
        gas:   4712388,
        gasPrice: 100000000000,
        provider: function() {
          return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/f6NOUQqHkXc64NJgRwvj")
        },
      },
    ropsten_geth:  {
       network_id: 3,
       host: "localhost",
       port:  8545,
       gas:   4700000
    }
  }
};
