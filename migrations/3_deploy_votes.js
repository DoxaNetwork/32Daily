var Votes = artifacts.require("./Votes.sol");

module.exports = function(deployer) {
  deployer.deploy(Votes);
};
