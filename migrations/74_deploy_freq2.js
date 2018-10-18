const PostChain = artifacts.require("./PostChain.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");
const HigherFreq = artifacts.require("./HigherFreq.sol")

const helpers = require('../src/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq2', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq2', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq2', 'VotesFactory');

    deployer.deploy(
        HigherFreq,
        10,
        DoxaHub.address,
        votesAddress,
        historyAddress,
        PostChain.address,
        tokenAddress
    );
};