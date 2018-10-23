const FreqFactory = artifacts.require("./FreqFactory.sol");
const helpers = require('../src/helpers')

module.exports = function(deployer) {
  deployer.then(function(){
    return FreqFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract(15);
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq1')
  })
}
