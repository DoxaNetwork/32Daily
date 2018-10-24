const FreqFactory = artifacts.require("./FreqFactory.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const helpers = require('../src/helpers')

let freq1Address;
module.exports = function(deployer) {
  deployer.then(function(){
    return FreqFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract(DoxaToken.address, 15);
  })
  .then(function(result) {
    freq1Address = helpers.recordFactory(result, 'freq1')
  })
  .then(function() {
    return DoxaToken.deployed();
  })
  .then(function(doxaToken) {
    doxaToken.addHub(freq1Address);
  })
}
