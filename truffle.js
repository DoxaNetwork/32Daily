module.exports = {
  migrations_directory: "./migrations",
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 8000000
    },
    ropsten_geth:  {
       network_id: 3,
       host: "localhost",
       port:  8545,
       gas:   8000000
    }
  }
};
