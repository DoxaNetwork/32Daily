var DoxaHub = artifacts.require("./DoxaHub.sol");

var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");
var VotingStuff = artifacts.require("./VotingStuff.sol");
var something = artifacts.require("./something.sol");
var BackableTokenSmall = artifacts.require("./BackableTokenSmall.sol");

module.exports = function(deployer) {


  deployer.deploy(ContentPool)
  .then(function() {
    return deployer.deploy(MemberRegistry);
  })
  .then(function() {
    return deployer.deploy(VotingStuff);
  })
  .then(function() {
    return deployer.deploy(something);
  })
  .then(function() {
    return deployer.deploy(BackableTokenSmall);
  })
  .then(function() {
    return deployer.deploy(
    	DoxaHub,
    	ContentPool.address,
    	MemberRegistry.address,
    	BackableTokenSmall.address,
    	something.address,
    	VotingStuff.address);
  });


  let voting, some, liltoken;

  deployer.then(function() {
  	return VotingStuff.deployed();
  }).then(function(instance) {
  	voting = instance;
  	return something.deployed()
  }).then(function(instance) {
  	some = instance;
  	return BackableTokenSmall.deployed();
  }).then(function(instance) {
  	liltoken = instance;
  	return DoxaHub.deployed();
  }).then(function(instance) {
  	let doxaHub = instance;
  	voting.assignHub(doxaHub.address);
  	some.assignHub(doxaHub.address);
  	liltoken.assignHub(doxaHub.address);
  });
};
