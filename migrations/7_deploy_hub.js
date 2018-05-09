var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");
var Votes = artifacts.require("./Votes.sol");
var PublishedHistory = artifacts.require("./PublishedHistory.sol");
var DoxaToken = artifacts.require("./DoxaToken.sol");
var DoxaHub = artifacts.require("./DoxaHub.sol");

module.exports = function(deployer) {
	deployer.deploy(
    	DoxaHub,
    	ContentPool.address,
    	MemberRegistry.address,
    	DoxaToken.address,
    	PublishedHistory.address,
    	Votes.address
  	);
};
