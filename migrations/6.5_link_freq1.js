var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");
var Votes = artifacts.require("./Votes.sol");
var PublishedHistory = artifacts.require("./PublishedHistory.sol");
var DoxaToken = artifacts.require("./DoxaToken.sol");
var TimeStamps = artifacts.require("./TimeStamps.sol");
var DoxaHub = artifacts.require("./DoxaHub.sol");


const fs = require('fs')

const historyPath = __dirname + '/../build/factories/' + 'HistoryFactory' + '.json';
const tokenPath = __dirname + '/../build/factories/' + 'TokenFactory' + '.json';
const votesPath = __dirname + '/../build/factories/' + 'VotesFactory' + '.json';

const historyData = require(historyPath)
const tokenData = require(tokenPath)
const votesData = require(votesPath)

const historyAddress = historyData.freq1;
const tokenAddress = tokenData.freq1;
const votesAddress = votesData.freq1;


module.exports = function(deployer) {
  let votes, publishedHistory, token, contentPool, timeStamps;

  deployer.then(function() {

    return Votes.at(votesAddress);

  }).then(function(instance) {

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
    return TimeStamps.deployed();

  }).then(function(instance) {

    timeStamps = instance;
    votes.assignHub(DoxaHub.address);
    publishedHistory.assignHub(DoxaHub.address);
    token.assignHub(DoxaHub.address);
    contentPool.assignHub(DoxaHub.address);
    timeStamps.assignHub(DoxaHub.address);

  });
};
