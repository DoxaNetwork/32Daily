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
    return instance.newContract(DoxaToken.address, 1);
  })
  .then(function(result) {
    freq1Address = helpers.recordFactory(result, 'freq1')
  })
  .then(function(){
    return MemberRegistry.deployed()
  })
  .then(function(registry){
    // this is the empty profile ipfs bytes 32 hash
    // {profile: "", image: null}
    registry.privilegedCreate(freq1Address, 'hourly', '0xe2fcad220630c8aaf3de6a3600931003de341d41638d8437631ed2f5fa54f37d')
  })
  .then(function() {
    return DoxaToken.deployed();
  })
  .then(function(doxaToken) {
    doxaToken.addHub(freq1Address);
  })
}
