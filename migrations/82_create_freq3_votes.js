const VotesFactory = artifacts.require("./VotesFactory.sol");
const helpers = require('../client/src/utils/helpers')

module.exports = function(deployer) {
  deployer.then(function(){
    return VotesFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract();
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq3', 'VotesFactory');
  })
}
