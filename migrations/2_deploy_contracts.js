var DoxaHub = artifacts.require("./DoxaHub.sol");

var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");
var Votes = artifacts.require("./Votes.sol");
var PublishedHistory = artifacts.require("./PublishedHistory.sol");
var BackableTokenSmall = artifacts.require("./BackableTokenSmall.sol");

module.exports = function(deployer) {


  deployer.deploy(ContentPool)
  .then(function() {
    return deployer.deploy(MemberRegistry);
  })
  .then(function() {
    return deployer.deploy(Votes);
  })
  .then(function() {
    return deployer.deploy(PublishedHistory);
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
    	PublishedHistory.address,
    	Votes.address);
  });


  let votes, publishedHistory, liltoken;

  deployer.then(function() {
  	return Votes.deployed();
  }).then(function(instance) {
  	votes = instance;
  	return PublishedHistory.deployed()
  }).then(function(instance) {
  	publishedHistory = instance;
  	return BackableTokenSmall.deployed();
  }).then(function(instance) {
  	liltoken = instance;
  	return DoxaHub.deployed();
  }).then(function(instance) {
  	let doxaHub = instance;
  	votes.assignHub(doxaHub.address);
  	publishedHistory.assignHub(doxaHub.address);
  	liltoken.assignHub(doxaHub.address);
  });
};
