const ContentPool = artifacts.require("./ContentPool.sol");
const Freq3 = artifacts.require("./Freq3.sol");
const HigherFreq = artifacts.require("./HigherFreq.sol");

const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq3', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq3', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq3', 'VotesFactory');

    deployer.deploy(
        Freq3,
        300,
        HigherFreq.address,
        votesAddress,
        historyAddress,
        ContentPool.address,
        tokenAddress
    );
};