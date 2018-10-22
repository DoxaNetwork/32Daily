const PostChain = artifacts.require("./PostChain.sol");
const Votes = artifacts.require("./Votes.sol");
const PublishedHistory = artifacts.require("./PublishedHistory.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const HigherFreq = artifacts.require("./HigherFreq.sol")
const DoxaHub = artifacts.require("./DoxaHub.sol");

const helpers = require('../src/helpers')

module.exports = function(deployer) {
  const historyAddress = helpers.readFactory('freq2', 'HistoryFactory');
  const tokenAddress = helpers.readFactory('freq2', 'TokenFactory');
  const votesAddress = helpers.readFactory('freq2', 'VotesFactory');
  const postChainAddress = helpers.readFactory('freq2', 'PostChainFactory');
  // const freq1ChainAddress = helpers.readFactory('freq1', 'PostChainFactory');

  let votes, publishedHistory, token, postChain;

  deployer.then(function(){
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
    return PostChain.at(postChainAddress);

  }).then(function(instance) {

    postChain = instance;

    votes.assignHub(HigherFreq.address);
    publishedHistory.assignHub(HigherFreq.address);
    token.assignHub(HigherFreq.address);
    postChain.assignHub(HigherFreq.address);

    return HigherFreq.deployed();

    }).then(function(higherFreq) {

      higherFreq.addChain(DoxaHub.address);

  })
}
