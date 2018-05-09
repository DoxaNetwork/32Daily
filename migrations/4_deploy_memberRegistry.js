var MemberRegistry = artifacts.require("./MemberRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(MemberRegistry);
};
