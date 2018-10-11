module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4712388
    },
    ropsten_geth:  {
       network_id: 3,
       host: "localhost",
       port:  8545,
       gas:   4700000
    }
  }
};
