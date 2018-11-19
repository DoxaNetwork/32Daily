const FreqFactory = artifacts.require("./FreqFactory.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const MemberRegistry = artifacts.require("./MemberRegistry.sol");

const helpers = require('../src/helpers')

let freq2address, freq3address;

module.exports = function(deployer) {
  deployer.then(function(){
    return FreqFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract(DoxaToken.address, 168);
  })
  .then(function(result) {
    freq3address = helpers.recordFactory(result, 'freq3')

    const freq2 = helpers.readFactory('freq2');
    freq2address = freq2['hub'];

    return DoxaHub.at(freq3address);
  })
  .then(function(freq3) {
    freq3.addChain(freq2address);
  })
  .then(function(){
    return MemberRegistry.deployed()
  })
  .then(function(registry){
    registry.privilegedCreate(freq3address, 'weekly', '0xe2fcad220630c8aaf3de6a3600931003de341d41638d8437631ed2f5fa54f37d')
  })
  .then(function() {
    return DoxaToken.deployed();
  })
  .then(function(doxaToken) {
    doxaToken.addHub(freq3address);
  })
}
