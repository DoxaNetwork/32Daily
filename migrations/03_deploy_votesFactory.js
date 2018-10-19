const VotesFactory = artifacts.require("./VotesFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(VotesFactory);
}