var BackableToken = artifacts.require("./BackableToken.sol");
var ContentPool = artifacts.require("./ContentPool.sol");

module.exports = function(deployer) {
  deployer.deploy(ContentPool).then(function() {
    return deployer.deploy(BackableToken, ContentPool.address);
  });
};
