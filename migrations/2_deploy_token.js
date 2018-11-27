const DoxaToken = artifacts.require("./DoxaToken.sol");

module.exports = function(deployer) {
  deployer.deploy(
    DoxaToken,
    'upbloc token',
    'UBL');
};
