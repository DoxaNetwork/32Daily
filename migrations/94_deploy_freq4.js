const ContentPool = artifacts.require("./ContentPool.sol");
const Freq4 = artifacts.require("./Freq4.sol");
const Freq3 = artifacts.require("./Freq3.sol");

const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq4', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq4', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq4', 'VotesFactory');

    deployer.deploy(
        Freq4,
        1000,
        Freq3.address,
        votesAddress,
        historyAddress,
        ContentPool.address,
        tokenAddress
    );
};