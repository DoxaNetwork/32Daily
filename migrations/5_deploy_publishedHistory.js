var PublishedHistory = artifacts.require("./PublishedHistory.sol");

module.exports = function(deployer) {
  deployer.deploy(PublishedHistory);
};
