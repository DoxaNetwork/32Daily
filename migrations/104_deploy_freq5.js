const ContentPool = artifacts.require("./ContentPool.sol");
const Freq5 = artifacts.require("./Freq5.sol");
const Freq4 = artifacts.require("./Freq4.sol");

const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq5', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq5', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq5', 'VotesFactory');

    deployer.deploy(
        Freq5,
        35,
        Freq4.address,
        votesAddress,
        historyAddress,
        ContentPool.address,
        tokenAddress
    );
};