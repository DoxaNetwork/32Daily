const assertJump = require('./assertJump');
var BackableTokenMock = artifacts.require("./BackableTokenMock.sol");

contract('BackableToken', function(accounts) {

	it("should return the correct totalSupply after construction", async function() {
		let token = await BackableTokenMock.new(accounts[0], 100, accounts[1], 100);
		let totalSupply = await token.totalSupply();

		assert.equal(totalSupply, 200)
	})

	it("should elect a user who hold enough token", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 100); 
		await token.confirmElection(accounts[0]);
		await token.confirmElection(accounts[1]);

		let AIsElected = await token.checkElectionStatus(accounts[0]);
		let BIsElected = await token.checkElectionStatus(accounts[1]);
		assert.equal(AIsElected, true);
		assert.equal(BIsElected, false);
	})

	it("should unelect a user if they send their token away", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900); 

		await token.transfer(accounts[1], 200, {from: accounts[0]});

		let AIsElected = await token.checkElectionStatus(accounts[0]);
		let BIsElected = await token.checkElectionStatus(accounts[1]);
		assert.equal(AIsElected, false);
		assert.equal(BIsElected, true);
	})

	it("should not allow sending to yourself", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900); 
		await token.confirmElection(accounts[0]);

		// can't back yourself, fool
		try {
			await token.back(accounts[0], 700, {from: accounts[0]});
			assert.fail('should have thrown before');
		} catch (error) {
			assertJump(error);
		}
	})

	it("backing should elect", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900);

		await token.confirmElection(accounts[0]);

		await token.back(accounts[1], 700, {from: accounts[0]});

		let AIsElected = await token.checkElectionStatus(accounts[0]);
		let BIsElected = await token.checkElectionStatus(accounts[1]);
		assert.equal(AIsElected, true);
		assert.equal(BIsElected, true);
	})

	it("should not allow double backing", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900); 

		await token.back(accounts[1], 700, {from: accounts[0]});

		try {
			await token.back(accounts[1], 700, {from: accounts[0]});
			assert.fail('should have thrown before');
		} catch (error) {
			assertJump(error);
		}
	})

	it("should not allow sending tokens when they are already backed", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900); 

		await token.back(accounts[1], 700, {from: accounts[0]});

		try {
			await token.transfer(accounts[1], 400, {from: accounts[0]});
			assert.fail('should have thrown before');
		} catch (error) {
			assertJump(error);
		}
	})

	it("should allow sending tokens after unbacking", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0); 

		await token.back(accounts[1], 700, {from: accounts[0]});
		await token.unback(accounts[1], {from: accounts[0]});

		await token.transfer(accounts[1], 400, {from: accounts[0]});

		let firstAccountBalance = await token.balanceOf(accounts[0]);

		assert.equal(firstAccountBalance, 1000 - 400);
	})

	it("should increase token price as supply increases", async function() {
		let token = await BackableTokenMock.new(accounts[0], 5000, accounts[1], 0); 
		
		let supplyOne = await token.totalSupply();
		await token.send(new web3.BigNumber(web3.toWei(5,'ether')), {from: accounts[0]});
		let supplyTwo = await token.totalSupply();
		let firstDispersal = supplyTwo - supplyOne;

		await token.send(new web3.BigNumber(web3.toWei(5,'ether')), {from: accounts[1]});
		let supplyThree = await token.totalSupply();
		let secondDispersal = supplyThree - supplyTwo;

		//console.log(firstDispersal);
		//console.log(secondDispersal);

		assert.ok(secondDispersal < firstDispersal);
	})

	it("should not allow non-elected user to add link", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		try {
			await token.postLink("reddit.com", {from : accounts[0]});
			assert.fail('should have thrown before');
		} catch (error) {
			assertJump(error);
		}

	})

	it("should allow elected user to add Link and be paid", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);
		
		await token.confirmElection(accounts[0]);
		let AIsElected = await token.checkElectionStatus(accounts[0]);
		assert.equal(AIsElected, true);

		await token.postLink("reddit.com", {from : accounts[0]});
		let links = token.links;
		console.log(links);

	})




})