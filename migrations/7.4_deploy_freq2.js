const ContentPool = artifacts.require("./ContentPool.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");
const HigherFreq = artifacts.require("./HigherFreq.sol")

const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq2', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq2', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq2', 'VotesFactory');
    let doxaHub, contentPool;

    DoxaHub.deployed()
    .then(function(instance) {
        doxaHub = instance;
        return ContentPool.deployed()
    }).then(function(instance) {
        contentPool = instance;
        deployer.deploy(
            HigherFreq,
            2,
            doxaHub.address,
            votesAddress,
            historyAddress,
            contentPool.address,
            tokenAddress
            )
    })
};