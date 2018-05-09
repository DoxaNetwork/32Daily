var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");
var Votes = artifacts.require("./Votes.sol");
var PublishedHistory = artifacts.require("./PublishedHistory.sol");
var DoxaToken = artifacts.require("./DoxaToken.sol");
var DoxaHub = artifacts.require("./DoxaHub.sol");

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
    return deployer.deploy(DoxaToken);
  })
  .then(function() {
    return deployer.deploy(
    	DoxaHub,
    	ContentPool.address,
    	MemberRegistry.address,
    	DoxaToken.address,
    	PublishedHistory.address,
    	Votes.address);
  });


  let votes, publishedHistory, token, contentPool;

  deployer.then(function() {

  	return Votes.deployed();

  }).then(function(instance) {

  	votes = instance;
  	return PublishedHistory.deployed()

  }).then(function(instance) {

  	publishedHistory = instance;
  	return DoxaToken.deployed();

  }).then(function(instance) {

  	token = instance;
  	return ContentPool.deployed();

  }).then(function(instance) {

    contentPool = instance;
    return DoxaHub.deployed();

  }).then(function(instance) {

  	let doxaHub = instance;
  	votes.assignHub(doxaHub.address);
  	publishedHistory.assignHub(doxaHub.address);
    token.assignHub(doxaHub.address);
  	contentPool.assignHub(doxaHub.address);

  });
};
