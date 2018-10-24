const FreqFactory = artifacts.require("./FreqFactory.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");
const helpers = require('../src/helpers')

let freq1address, freq2address;

module.exports = function(deployer) {
  deployer.then(function(){
    return FreqFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract(DoxaToken.address, 30);
  })
  .then(function(result) {
    freq2address = helpers.recordFactory(result, 'freq2')

    const freq1 = helpers.readFactory('freq1');
    freq1address = freq1['hub'];

    return DoxaHub.at(freq2address);
  })
  .then(function(freq2) {
    freq2.addChain(freq1address);
  })
  .then(function() {
    return DoxaToken.deployed();
  })
  .then(function(doxaToken) {
    doxaToken.addHub(freq2address);
  })
}
