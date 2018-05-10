var TimeStamps = artifacts.require("./TimeStamps.sol");

module.exports = function(deployer) {
  deployer.deploy(TimeStamps);
};
