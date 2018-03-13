var BackableToken = artifacts.require("./BackableToken.sol");

module.exports = function(deployer) {
  deployer.deploy(BackableToken);
};
