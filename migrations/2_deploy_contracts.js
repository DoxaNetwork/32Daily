var BackableToken = artifacts.require("./BackableToken.sol");

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
    	BackableToken,
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
  	return BackableToken.deployed();
  }).then(function(instance) {
  	let backableToken = instance;
  	voting.assignHub(backableToken.address);
  	some.assignHub(backableToken.address);
  	liltoken.assignHub(backableToken.address);
  });
};
