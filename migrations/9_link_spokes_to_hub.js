var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");
var Votes = artifacts.require("./Votes.sol");
var PublishedHistory = artifacts.require("./PublishedHistory.sol");
var DoxaToken = artifacts.require("./DoxaToken.sol");
var TimeStamps = artifacts.require("./TimeStamps.sol");
var DoxaHub = artifacts.require("./DoxaHub.sol");

module.exports = function(deployer) {
  let votes, publishedHistory, token, contentPool, timeStamps;

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
  	return TimeStamps.deployed();

  }).then(function(instance) {

    timeStamps = instance;
    return DoxaHub.deployed();

  }).then(function(instance) {

  	let doxaHub = instance;
  	votes.assignHub(doxaHub.address);
  	publishedHistory.assignHub(doxaHub.address);
    token.assignHub(doxaHub.address);
  	contentPool.assignHub(doxaHub.address);
  	timeStamps.assignHub(doxaHub.address);

  });
};
