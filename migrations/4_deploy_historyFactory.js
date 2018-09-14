const HistoryFactory = artifacts.require("./HistoryFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(HistoryFactory);
}