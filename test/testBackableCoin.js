// var BackableTokenMock = artifacts.require("./BackableTokenMock.sol");
var DoxaHub = artifacts.require("./DoxaHub.sol");
var ContentPool = artifacts.require("./ContentPool.sol");
var MemberRegistry = artifacts.require("./MemberRegistry.sol");
var VotingStuff = artifacts.require("./VotingStuff.sol");
var something = artifacts.require("./something.sol");
var BackableTokenSmallMock = artifacts.require("./BackableTokenSmallMock.sol");

//var Web3 = require('web3');
//var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const BigNumber = web3.BigNumber;

// const toAscii = require('../src/utils/helpers')
function toAscii(hex) {
    let zeroPaddedString = web3.toAscii(hex);
    return zeroPaddedString.split("\u0000")[0];
}


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('DoxaHub', function(accounts) {

	let contentPool;
	let memberRegistry;
	let token;
	const REGISTRATION_MINT = 1000;
	const SUBMISSION_MINT = 1;

	beforeEach(async function() {
		contentPool = await ContentPool.new();
		memberRegistry = await MemberRegistry.new();
		votingStuff = await VotingStuff.new();
		published = await something.new();
		smallToken = await BackableTokenSmallMock.new(accounts[0], 1000, accounts[1], 900);
		token = await DoxaHub.new(
			contentPool.address, 
			memberRegistry.address, 
			smallToken.address,
			published.address,
			votingStuff.address
		)

		await smallToken.assignHub(token.address, {from : accounts[0]});
		await votingStuff.assignHub(token.address, {from : accounts[0]});
		await published.assignHub(token.address, {from : accounts[0]});
	})

	// beforeEach(async function() {
	// 	await contentPool.clear();
	// })

	// it("should return the correct totalSupply after construction", async function() {
	// 	let totalSupply = await token.totalSupply();

	// 	assert.equal(totalSupply, 1900)
	// })

	// it("should not allow backing yourself", async function() {
	// 	await token.back(accounts[0], 700, {from: accounts[0]}).should.be.rejectedWith('revert');
	// })

	it("user can back a post", async function() {
		// await token.register('enodios', {from: accounts[1]});
		// user 1 posts a link
		await token.postLink("reddit.com", {from : accounts[1]});

		// link should have 0 backing
		// TODO should automatically have the poster's backing too

		// user 0 backs the link with 1000
		await token.backPost(0, 1000, {from: accounts[0]});

		// // link should now have 1000 backing
		const backing = await token.totalPostBacking(0);
		backing.toNumber().should.be.equal(1000);

		// // user 0 should have 0 available backing
		const tokensRemaining0 = await token.availableToTransfer(accounts[0]);
		tokensRemaining0.toNumber().should.be.equal(0);

		// // user 1 should have 1900 + 1 available backing
		const tokensRemaining1 = await token.availableToTransfer(accounts[1]);
		tokensRemaining1.toNumber().should.be.equal(901);
    })
    
    it("user cannot over-back a post", async function() {
        // await token.register('enodios', {from: accounts[1]});
                
		// user 1 posts a link
		await token.postLink("reddit.com", {from : accounts[1]});

		// user 0 backs the link with 1000
        await token.backPost(0, 1000, {from: accounts[0]});
        
		// user 0 backs the link with 1 more, which is too many
		await token.backPost(0, 1, {from: accounts[0]}).should.be.rejectedWith('revert');
	})

	// it("should not allow double backing", async function() {
	// 	await token.back(accounts[1], 700, {from: accounts[0]});

	// 	await token.back(accounts[1], 700, {from: accounts[0]}).should.be.rejectedWith('revert');
	// })

	// it("should not allow sending tokens when they are already backed", async function() {
	// 	let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900);
	// 	await token.back(accounts[1], 700, {from: accounts[0]});

	// 	await token.transfer(accounts[1], 400, {from: accounts[0]}).should.be.rejectedWith('revert');
	// })

	// it("should allow sending tokens after unbacking", async function() {
	// 	let token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900);
	// 	await token.back(accounts[1], 700, {from: accounts[0]});
	// 	await token.unback(accounts[1], 700, {from: accounts[0]});

	// 	await token.transfer(accounts[1], 400, {from: accounts[0]});

	// 	let firstAccountBalance = await token.balanceOf(accounts[0]);

	// 	assert.equal(firstAccountBalance, 1000 - 400);
	// })

	// it("should allow a user to register a name and receive token", async function() {
	// 	let balanceBefore = await token.balanceOf(accounts[0]);
	// 	await token.register('enodios');

	// 	let [username, , balanceAfter, , ] = await token.getMemberByAddress(accounts[0]);
	// 	const balanceDifference = balanceAfter.toNumber() - balanceBefore.toNumber();

	// 	assert.equal(toAscii(username), 'enodios');
	// 	assert.equal(balanceDifference, REGISTRATION_MINT);
	// });

	it("should allow user to post Link and receive token", async function() {
		let balanceBefore = await smallToken.balanceOf(accounts[1]);
		await token.postLink("reddit.com", {from : accounts[1]});

		let balanceAfter = await smallToken.balanceOf(accounts[1]);
		const balanceDifference = balanceAfter.toNumber() - balanceBefore.toNumber();

		let [index, owner, link, backing] = await token.getLinkByIndex(0);

		assert.equal("reddit.com", toAscii(link));
		assert.equal(accounts[1], owner);

		assert.equal(balanceDifference, SUBMISSION_MINT);

	})

	it("should get link count", async function() {
		// await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[1]});

		let count = await token.getLinkCount();
		assert.equal(1, count);

	})

	it("should fail to get link and owner of out of bound index at border", async function() {
		// await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[0]});
		await token.postLink("google.com", {from : accounts[1]});
		await token.getLinkByIndex(2).should.be.rejectedWith('revert');
	})

	// it("publish single post above threshold", async function() {
	// 	await token.postLink("reddit2.com", {from : accounts[0]});
	// 	await token.postLink("reddit.com", {from : accounts[0]});
	// 	await token.backPost(1, 10, {from : accounts[1]});
	// 	result = await token.publish();

	// 	version = await token.currentVersion();
	// 	// we need this because a block could have 0 or 2+ items
	// 	blockLength = await token.getVersionLength(version);

	// 	// what is this item?
	// 	const [poster, content] = await token.getPublishedItem(version,blockLength-1);
	// 	// console.log("content: " + toAscii(content))

	// 	assert.equal(toAscii(content), 'reddit.com');
	// 	// assert.equal( result.toNumber(), 1 );
	// })

	it("should clear incoming post votes", async function() {
		await token.postLink("reddit.com", {from : accounts[0]});
		await token.backPost(0, 10, {from : accounts[1]});
		
		const votesBefore = await token.totalPostBacking(0);
		assert.equal(votesBefore.toNumber(), 10);

		await token.clear();

		const votesAfter = await token.totalPostBacking(0);
		assert.equal(votesAfter.toNumber(), 0);
	})

	// it("should clear outgoing post votes", async function() {
	// 	token = await BackableTokenMock.new(contentPool.address, memberRegistry.address, accounts[0], 1000, accounts[1], 900);
	// 	await token.postLink("reddit.com", {from : accounts[0]});
	// 	await token.backPost(0, 10, {from : accounts[1]});
		
	// 	const votesAvailableBefore = await token.availableToBackPosts(accounts[1]);
	// 	assert.equal(votesAvailableBefore.toNumber(), 890);
		
	// 	await token.clear();

	// 	const votesAvailableAfter = await token.availableToBackPosts(accounts[1]);
	// 	assert.equal(votesAvailableAfter.toNumber(), 900);
	// })

	// // broken until I find some way to stub out time
	// it("should publish top post", async function() {
	// 	await token.postLink("reddit.com", {from : accounts[0]});
	// 	await token.postLink("facebook.com", {from : accounts[1]});
	// 	await token.backPost(0, 9, {from : accounts[1]});
	// 	await token.publish();

	// 	// [poster, content] = await token.getPublishedItem(0,0);

	// 	// assert.equal(poster, accounts[0]);
	// 	// assert.equal(toAscii(content), 'reddit.com');
	// })

	// // broken until I find some way to stub out time
	// it("should publish first post in case of tie", async function() {
	// 	await token.postLink("facebook.com", {from : accounts[1]});
	// 	await token.postLink("reddit.com", {from : accounts[0]});
	// 	await token.publish();

	// 	[poster, content] = await token.getPublishedItem(0,0);

	// 	assert.equal(poster, accounts[1]);
	// 	assert.equal(toAscii(content), 'facebook.com');
	// })

	it("should set nextPublishTime as next UTC midnight", async function() {
		const nextPublishTime = await token.nextPublishTime();

		const jsTimestamp = Math.round((new Date()).getTime() / 1000);
		const nextUTCMidnight = Math.floor(jsTimestamp / 86400) * 86400 + 86400;

		assert.equal(nextPublishTime.toNumber(), nextUTCMidnight)
	})
})