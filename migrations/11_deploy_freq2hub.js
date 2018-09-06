var ContentPool = artifacts.require("./ContentPool.sol");
var Votes2 = artifacts.require("./Votes2.sol");
var PublishedHistory2 = artifacts.require("./PublishedHistory2.sol");
var DoxaHub = artifacts.require("./DoxaHub.sol");
var HigherFreq = artifacts.require("./HigherFreq.sol");

module.exports = function(deployer) {
    deployer.deploy(
        HigherFreq,
        DoxaHub.address,
        2,
        Votes2.address,
        PublishedHistory2.address,
        ContentPool.address
    );
};
