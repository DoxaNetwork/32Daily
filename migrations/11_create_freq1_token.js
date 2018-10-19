const TokenFactory = artifacts.require("./TokenFactory.sol");
const helpers = require('../src/helpers')

module.exports = function(deployer) {
  deployer.then(function(){
    return TokenFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract();
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq1', 'TokenFactory')
  })
}