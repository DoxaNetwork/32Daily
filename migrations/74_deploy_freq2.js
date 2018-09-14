const ContentPool = artifacts.require("./ContentPool.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");
const HigherFreq = artifacts.require("./HigherFreq.sol")

const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq2', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq2', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq2', 'VotesFactory');

    deployer.deploy(
        HigherFreq,
        20,
        DoxaHub.address,
        votesAddress,
        historyAddress,
        ContentPool.address,
        tokenAddress
    );
};