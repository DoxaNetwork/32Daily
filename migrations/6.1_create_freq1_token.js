const TokenFactory = artifacts.require("./TokenFactory.sol");
const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
  TokenFactory.deployed()
  .then(function(instance) {
    return instance.newContract();
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq1', 'TokenFactory')
  })
}