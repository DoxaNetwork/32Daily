const ContentPool = artifacts.require("./ContentPool.sol");
const Votes = artifacts.require("./Votes.sol");
const PublishedHistory = artifacts.require("./PublishedHistory.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const Freq5 = artifacts.require("./Freq5.sol")

const helpers = require('../src/utils/helpers')

module.exports = function(deployer) {
  const historyAddress = helpers.readFactory('freq5', 'HistoryFactory');
  const tokenAddress = helpers.readFactory('freq5', 'TokenFactory');
  const votesAddress = helpers.readFactory('freq5', 'VotesFactory');

  let votes, publishedHistory, token, contentPool;

  deployer.then(function() {
    return Votes.at(votesAddress)
  })
  .then(function(instance) {

    votes = instance;
    return PublishedHistory.at(historyAddress)

  }).then(function(instance) {

    publishedHistory = instance;
    return DoxaToken.at(tokenAddress);

  }).then(function(instance) {

    token = instance;
    return ContentPool.deployed();

  }).then(function(instance) {

    contentPool = instance;
    votes.assignHub(Freq5.address);
    publishedHistory.assignHub(Freq5.address);
    token.assignHub(Freq5.address);
    // contentPool.assignHub(HigherFreq.address);
  })
}
