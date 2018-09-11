var ContentPool = artifacts.require("./ContentPool.sol");
var Votes2 = artifacts.require("./Votes2.sol");
var PublishedHistory2 = artifacts.require("./PublishedHistory2.sol");
var DoxaHub = artifacts.require("./DoxaHub.sol");
var HigherFreq = artifacts.require("./HigherFreq.sol");
var DoxaToken2 = artifacts.require("./DoxaToken2.sol");

module.exports = function(deployer) {

    let higherFreq, token;

    deployer.deploy(
        HigherFreq,
        2,
        DoxaHub.address,
        Votes2.address,
        PublishedHistory2.address,
        ContentPool.address,
        DoxaToken2.address
    ).then(function(instance) {
        higherFreq = instance;
        return DoxaToken2.deployed()
    }).then(function(instance) {
        token = instance;
        token.assignHub(higherFreq.address)
    })
};
