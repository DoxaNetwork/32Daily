const FreqFactory = artifacts.require("./FreqFactory.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");
const helpers = require('../src/helpers')

let freq2address, freq3address;

module.exports = function(deployer) {
  deployer.then(function(){
    return FreqFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract(60);
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq3')

    const freq2 = helpers.readFactory('freq2');
    const freq3 = helpers.readFactory('freq3');
    freq2address = freq2['hub'];
    freq3address = freq3['hub'];

    return DoxaHub.at(freq3address);
  })
  .then(function(freq3) {
    freq3.addChain(freq2address);
  })
}
