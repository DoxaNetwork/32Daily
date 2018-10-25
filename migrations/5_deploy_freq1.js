const FreqFactory = artifacts.require("./FreqFactory.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const MemberRegistry = artifacts.require("./MemberRegistry.sol");

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
  .then(function(){
    return MemberRegistry.deployed()
  })
  .then(function(registry){
    registry.privilegedCreate(freq1Address, 'hourly', 'QmboVyQ5q8oMDY5sC6cfJNmE5cMAhwM1oxSEkExxPCubok')
  })
  .then(function() {
    return DoxaToken.deployed();
  })
  .then(function(doxaToken) {
    doxaToken.addHub(freq1Address);
  })
}
