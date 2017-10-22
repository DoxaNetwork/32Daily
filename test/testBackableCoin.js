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

	it("should not allow double backing", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900); 
		await token.confirmElection(accounts[0]);

		await token.back(accounts[0], 700, {from: accounts[0]});

		let AIsElected = await token.checkElectionStatus(accounts[0]);
		let BIsElected = await token.checkElectionStatus(accounts[1]);
		assert.equal(AIsElected, true);
		assert.equal(BIsElected, true);

		// this should fail
		await token.back(accounts[0], 700, {from: accounts[0]});
	})

})


// if a user backs another user, they cannot send those tokens
// and they cannot back another user
// if they pull back their backing, they can now send those tokens