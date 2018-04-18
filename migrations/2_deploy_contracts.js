var BackableToken = artifacts.require("./BackableToken.sol");
var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");

module.exports = function(deployer) {
  deployer.deploy(ContentPool)
  .then(function() {
    return deployer.deploy(MemberRegistry);
  })
  .then(function() {
    return deployer.deploy(BackableToken, ContentPool.address, MemberRegistry.address);
  });
};
