// const DoxaHub = artifacts.require("./DoxaHub.sol");
const HigherFreq = artifacts.require("./HigherFreq.sol")

const helpers = require('../src/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq2', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq2', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq2', 'VotesFactory');
    // const baseChainAddress = helpers.readFactory('freq1', 'PostChainFactory');
    const postChainAddress = helpers.readFactory('freq2', 'PostChainFactory');

    deployer.deploy(
        HigherFreq,
        30,
        tokenAddress,
        postChainAddress,
        votesAddress,
        historyAddress,
    );
};