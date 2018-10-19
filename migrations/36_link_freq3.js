const PostChain = artifacts.require("./PostChain.sol");
const Votes = artifacts.require("./Votes.sol");
const PublishedHistory = artifacts.require("./PublishedHistory.sol");
const DoxaToken = artifacts.require("./DoxaToken.sol");
const Freq3 = artifacts.require("./Freq3.sol")

const helpers = require('../src/helpers')

module.exports = function(deployer) {
  const historyAddress = helpers.readFactory('freq3', 'HistoryFactory');
  const tokenAddress = helpers.readFactory('freq3', 'TokenFactory');
  const votesAddress = helpers.readFactory('freq3', 'VotesFactory');
  const postChainAddress = helpers.readFactory('freq3', 'PostChainFactory');

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

    votes.assignHub(Freq3.address);
    publishedHistory.assignHub(Freq3.address);
    token.assignHub(Freq3.address);
    postChain.assignHub(Freq3.address);
  })
}
