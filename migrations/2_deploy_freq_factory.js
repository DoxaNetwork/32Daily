const FreqFactory = artifacts.require("./FreqFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(FreqFactory);
};