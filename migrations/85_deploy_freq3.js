const PostChain = artifacts.require("./PostChain.sol");
const PostChain3 = artifacts.require("./PostChain3.sol");
const Freq3 = artifacts.require("./Freq3.sol");
const HigherFreq = artifacts.require("./HigherFreq.sol");

const helpers = require('../src/helpers')

module.exports = function(deployer) {
    const historyAddress = helpers.readFactory('freq3', 'HistoryFactory');
    const tokenAddress = helpers.readFactory('freq3', 'TokenFactory');
    const votesAddress = helpers.readFactory('freq3', 'VotesFactory');

    deployer.deploy(
        Freq3,
        100,
        HigherFreq.address,
        votesAddress,
        historyAddress,
        PostChain.address,
        PostChain3.address,
        tokenAddress
    );
};