const FreqFactory = artifacts.require("./FreqFactory.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");
const helpers = require('../src/helpers')

let freq1address, freq2address;

module.exports = function(deployer) {
  deployer.then(function(){
    return FreqFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract(30);
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq2')

    const freq1 = helpers.readFactory('freq1');
    const freq2 = helpers.readFactory('freq2');
    freq1address = freq1['hub'];
    freq2address = freq2['hub'];

    return DoxaHub.at(freq2address);
  })
  .then(function(freq2) {
    freq2.addChain(freq1address);
  })
}
