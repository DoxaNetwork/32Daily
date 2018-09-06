// const toAscii = require('../src/utils/helpers')
var DoxaHub = artifacts.require("./DoxaHub.sol");
var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");
var Votes = artifacts.require("./Votes.sol");
var PublishedHistory = artifacts.require("./PublishedHistory.sol");
var DoxaTokenMock = artifacts.require("./DoxaTokenMock.sol");
var TimeStamps = artifacts.require("./TimeStamps.sol");

function toAscii(hex) {
    let zeroPaddedString = web3.toAscii(hex);
    return zeroPaddedString.split("\u0000")[0];
}

const HigherFreq = artifacts.require("./HigherFreq.sol");

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

function ByteArrayToString(array) {
    // should use reduce here instead
    let output = '';
    for (let i = 0; i < array.length; i++) {
        output += toAscii(array[i]);
    }
    return output;
}

function stringToChunkedArray(string) {
    return string.match(/.{1,32}/g);
}

contract('HigherFreq', function(accounts) {

    let contentPool;
    let memberRegistry;
    let hub;
    const REGISTRATION_MINT = 1000;
    const SUBMISSION_MINT = 1;

    beforeEach(async function() {
        contentPool = await ContentPool.new();
        memberRegistry = await MemberRegistry.new();
        votes = await Votes.new();
        publishedHistory = await PublishedHistory.new();
        timeStamps = await TimeStamps.new();
        token = await DoxaTokenMock.new(accounts[0], 1000, accounts[1], 900);
        hub = await DoxaHub.new(
            contentPool.address, 
            memberRegistry.address, 
            token.address,
            publishedHistory.address,
            votes.address,
            timeStamps.address
        );

        await token.assignHub(hub.address, {from : accounts[0]});
        await publishedHistory.assignHub(hub.address, {from : accounts[0]});
        await contentPool.assignHub(hub.address, {from : accounts[0]});
        await timeStamps.assignHub(hub.address, {from : accounts[0]});

        higherVotes = await Votes.new();
        higherpublishedHistory = await PublishedHistory.new();
        higherFreq = await HigherFreq.new(
            2,
            hub.address,
            higherVotes.address,
            higherpublishedHistory.address,
            contentPool.address
        );
        await higherVotes.assignHub(higherFreq.address, {from : accounts[0]});
        await higherpublishedHistory.assignHub(higherFreq.address, {from : accounts[0]});
    })

    it("should pick up published items from lower freq", async function() {
        await hub.postLink(stringToChunkedArray("reddit.com"), {from : accounts[1]});
        await hub.publish()

        await hub.postLink(stringToChunkedArray("twitter.com"), {from : accounts[1]});
        await hub.publish()

        const [length, timeStamp] = await hub.getVersion(0);
        assert.equal(length, 1);

        // const [address, content] = await hub.getPublishedItem(0,0)
        const [address, content, votes] = await higherFreq.getItem(0)

        assert.equal(ByteArrayToString(content), "reddit.com")
        assert.equal(votes, 0)
    })

    it("should accept vote for an item", async function() {
        await hub.postLink(stringToChunkedArray("reddit.com"), {from : accounts[1]});
        await hub.publish()

        await hub.postLink(stringToChunkedArray("twitter.com"), {from : accounts[1]});
        await hub.publish()

        await higherFreq.cycle();

        await higherFreq.vote(0)

        const [address, content, votes] = await higherFreq.getItem(0)

        assert.equal(ByteArrayToString(content), "reddit.com")
        assert.equal(votes, 1)
    })

    it("should not accept vote before voting window is opened", async function() {
        await hub.postLink(stringToChunkedArray("reddit.com"), {from : accounts[1]});
        await hub.publish()

        await higherFreq.vote(0).should.be.rejectedWith('revert');
    })

    it("should publish top item", async function() {
        await hub.postLink(stringToChunkedArray("reddit.com"), {from : accounts[1]});
        await hub.publish()

        await higherFreq.cycle();

        await higherFreq.publish();

        const [address, content] = await higherFreq.getPublishedItem(0);
        assert.equal(ByteArrayToString(content), "reddit.com")
    })

    it("should not publish before voting window is opened", async function() {
        await hub.postLink(stringToChunkedArray("reddit2.com"), {from : accounts[1]});
        await hub.publish()

        await higherFreq.publish();
        await higherFreq.getPublishedItem(0).should.be.rejectedWith('revert');
    })
})