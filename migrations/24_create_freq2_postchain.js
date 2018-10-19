const PostChainFactory = artifacts.require("./PostChainFactory.sol");
const helpers = require('../src/helpers')

module.exports = function(deployer) {
  deployer.then(function(){
    return PostChainFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract();
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq2', 'PostChainFactory');
  })
}
