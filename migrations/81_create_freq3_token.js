const TokenFactory = artifacts.require("./TokenFactory.sol");
const helpers = require('../client/src/utils/helpers')

module.exports = function(deployer) {
  deployer.then(function(){
    return TokenFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract();
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq3', 'TokenFactory')
  })
}