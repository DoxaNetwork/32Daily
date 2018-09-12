const HistoryFactory = artifacts.require("./HistoryFactory.sol");
const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
  deployer.then(function(){
    return HistoryFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract();
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq1', 'HistoryFactory');
  })
}
