var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var BackableToken = artifacts.require("./BackableToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(BackableToken);
};
