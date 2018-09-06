var Votes2 = artifacts.require("./Votes2.sol");
var PublishedHistory2 = artifacts.require("./PublishedHistory2.sol");

module.exports = function(deployer) {

    deployer.deploy(Votes2)
    deployer.deploy(PublishedHistory2)
};
