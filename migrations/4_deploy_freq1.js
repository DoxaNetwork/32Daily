// const DoxaHub = artifacts.require("./DoxaHub.sol");
// 
// const helpers = require('../src/helpers')
// 
// module.exports = function(deployer) {
//     const historyAddress = helpers.readFactory('freq1', 'HistoryFactory');
//     const tokenAddress = helpers.readFactory('freq1', 'TokenFactory');
//     const votesAddress = helpers.readFactory('freq1', 'VotesFactory');
//     const postChainAddress = helpers.readFactory('freq1', 'PostChainFactory');
// 
//     deployer.deploy(
//         DoxaHub,
//         15,
//         tokenAddress,
//         postChainAddress,
//         votesAddress,
//         historyAddress
//     );
// };

const FreqFactory = artifacts.require("./FreqFactory.sol");
const helpers = require('../src/helpers')

module.exports = function(deployer) {
  deployer.then(function(){
    return FreqFactory.deployed()
  })
  .then(function(instance) {
    return instance.newContract(15);
  })
  .then(function(result) {
    helpers.recordFactory(result, 'freq1')
  })
}
