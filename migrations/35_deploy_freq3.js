// const HigherFreq = artifacts.require("./HigherFreq.sol")
const Freq3 = artifacts.require("./Freq3.sol")

const helpers = require('../src/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq3', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq3', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq3', 'VotesFactory');
    // const baseChainAddress = helpers.readFactory('freq1', 'PostChainFactory');
    const postChainAddress = helpers.readFactory('freq3', 'PostChainFactory');

    deployer.deploy(
        Freq3,
        60,
        tokenAddress,
        postChainAddress,
        votesAddress,
        historyAddress,
    );
};