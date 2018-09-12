const ContentPool = artifacts.require("./ContentPool.sol");
const MemberRegistry = artifacts.require("./MemberRegistry.sol");
const Votes = artifacts.require("./Votes.sol");
const PublishedHistory = artifacts.require("./PublishedHistory.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const DoxaHub = artifacts.require("./DoxaHub.sol");

const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq1', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq1', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq1', 'VotesFactory');

    deployer.deploy(
        DoxaHub,
        ContentPool.address,
        tokenAddress,
        historyAddress,
        votesAddress
    );
};
