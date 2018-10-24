const DoxaToken = artifacts.require("./DoxaToken.sol");

module.exports = function(deployer) {
  deployer.deploy(
    DoxaToken,
    'ACME Token',
    'ACME');
};
