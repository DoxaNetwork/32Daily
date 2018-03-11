var BackableTokenMock = artifacts.require("./BackableTokenMock.sol");

//var Web3 = require('web3');
//var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('BackableToken', function(accounts) {

	it("should return the correct totalSupply after construction", async function() {
		let token = await BackableTokenMock.new(accounts[0], 100, accounts[1], 100);
		let totalSupply = await token.totalSupply();

		assert.equal(totalSupply, 200)
	})

	it("should elect a user who holds enough token", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 100); 

		await token.checkElection(accounts[0]);
		await token.checkElection(accounts[1]);

		let AIsElected = await token.isElected(accounts[0]);
		let BIsElected = await token.isElected(accounts[1]);
		assert.equal(AIsElected, true);
		assert.equal(BIsElected, false);
	})

	it("should unelect a user if they send their token away", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900); 

		await token.transfer(accounts[1], 200, {from: accounts[0]});

		let AIsElected = await token.isElected(accounts[0]);
		let BIsElected = await token.isElected(accounts[1]);
		assert.equal(AIsElected, false);
		assert.equal(BIsElected, true);
	})

	it("should not allow sending to yourself", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900); 

		// can't back yourself, fool
		await token.back(accounts[0], 700, {from: accounts[0]}).should.be.rejectedWith('revert');
	})

	it("backing should elect", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900);

		await token.checkElection(accounts[0]);
		await token.back(accounts[1], 700, {from: accounts[0]});

		let AIsElected = await token.isElected(accounts[0]);
		let BIsElected = await token.isElected(accounts[1]);
		assert.equal(AIsElected, true);
		assert.equal(BIsElected, true);
	})

	it("user can back a post", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900);
		await token.register.sendTransaction('enodios', {from: accounts[1]});
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
		const tokensRemaining0 = await token.availableToBackPosts(accounts[0]);
		tokensRemaining0.toNumber().should.be.equal(0);

		// // user 1 should have 900 available backing
		const tokensRemaining1 = await token.availableToBackPosts(accounts[1]);
		tokensRemaining1.toNumber().should.be.equal(1900);
	})

	it("should not allow double backing", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900); 

		await token.back(accounts[1], 700, {from: accounts[0]});

		await token.back(accounts[1], 700, {from: accounts[0]}).should.be.rejectedWith('revert');
	})

	it("should not allow sending tokens when they are already backed", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 900); 

		await token.back(accounts[1], 700, {from: accounts[0]});

		await token.transfer(accounts[1], 400, {from: accounts[0]}).should.be.rejectedWith('revert');
	})

	it("should allow sending tokens after unbacking", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0); 

		await token.back(accounts[1], 700, {from: accounts[0]});
		await token.unback(accounts[1], 700, {from: accounts[0]});

		await token.transfer(accounts[1], 400, {from: accounts[0]});

		let firstAccountBalance = await token.balanceOf(accounts[0]);

		assert.equal(firstAccountBalance, 1000 - 400);
	})

	// not yet implemented
	// it("should increase token price as supply increases", async function() {
	// 	let token = await BackableTokenMock.new(accounts[0], 5000, accounts[1], 0); 
		
	// 	let supplyOne = await token.totalSupply();

	// 	await token.send(new web3.BigNumber(web3.toWei(5,'ether')));
	// 	let supplyTwo = await token.totalSupply();

	// 	await token.send(new web3.BigNumber(web3.toWei(5,'ether')));
	// 	let supplyThree = await token.totalSupply();

	// 	let firstDispersal = supplyTwo - supplyOne;
	// 	let secondDispersal = supplyThree - supplyTwo;
	// 	assert.ok(secondDispersal < firstDispersal);
	// })

	it("should not allow non-elected user to add link", async function() {
		let token = await BackableTokenMock.new(accounts[0], 900, accounts[1], 0);

		await token.postLink("reddit.com", {from : accounts[0]}).should.be.rejectedWith('revert');
	});

	it("should allow a member with token to register a name", async function() {
		let token = await BackableTokenMock.new(accounts[0], 100, accounts[1], 0); 

		await token.createMember(accounts[0], 'enodios');

		let [address, username, active, elected, balance, backing] = await token.findMemberByAddress(accounts[0]);

		assert.equal(username, 'enodios');
		assert.equal(active, true);
		assert.equal(elected, false);

		let [address2, username2, active2, elected2, balance2, backing2] = await token.findMemberByUserName('enodios');

		assert.equal(username2, 'enodios');
		assert.equal(active2, true);
		assert.equal(elected2, false);
	});

	it("should allow a new user to buy token and register a name", async function() {
		let token = await BackableTokenMock.new(accounts[0], 100, accounts[1], 0); 

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		let [address, username, active, elected, balance, backing] = await token.findMemberByAddress(accounts[1]);
		
		assert.ok(balance == 1000);
		assert.equal(username, 'enodios');
		assert.equal(active, true);
		assert.equal(elected, true);
	});

	// it("should allow a new user to buy a little token and register a name", async function() {
	// 	let token = await BackableTokenMock.new(accounts[0], 100, accounts[1], 0); 

	// 	await token.register.sendTransaction('enodios', {from: accounts[1]});

	// 	let [address, username, active, elected, balance, backing] = await token.findMemberByAddress(accounts[1]);
		
	// 	assert.ok(balance < 1000);
	// 	assert.equal(username, 'enodios');
	// 	assert.equal(active, true);
	// 	assert.equal(elected, false);
	// });

	// it("should retrieve elected member by index", async function() {
	// 	let token = await BackableTokenMock.new(accounts[0], 100, accounts[1], 0); 

	// 	await token.register.sendTransaction('enodios', {from: accounts[1]});

	// 	let [address, username, active, elected, balance, backing] = await token.findMemberByIndex(0);

	// 	assert.equal(username, 'enodios');
	// 	assert.equal(active, true);
	// 	assert.equal(elected, true);
	// })

	// it("should retrieve unelected member by index", async function() {
	// 	let token = await BackableTokenMock.new(accounts[0], 100, accounts[1], 0); 

	// 	await token.register.sendTransaction('enodios', {from: accounts[1]});

	// 	let [address, username, active, elected, balance, backing] = await token.findMemberByIndex(0);

	// 	assert.equal(username, 'enodios');
	// 	assert.equal(active, true);
	// 	assert.equal(elected, false);
	// })

	it("should allow user to post Link", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[1]});

		let links = await token.links.call(0);
		assert.equal("reddit.com",links);

	})

	it("should get link count", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[1]});

		let count = await token.getLinkTotalCount();
		assert.equal(1, count);

	})

	it("should get link count of 2", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[1]});
		await token.postLink("google.com", {from : accounts[1]});


		let count = await token.getLinkTotalCount();
		assert.equal(2, count);
	})

	it("should get link count of 2 for separate users", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[0]});
		await token.postLink("google.com", {from : accounts[1]});

		let count = await token.getLinkTotalCount();
		assert.equal(2, count);
	})

	it("should be able to get link and owner", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[0]});

		let [index, poster, link] = await token.getLinkByIndex( 0 );
		assert.equal(index, 0);
		assert.equal(poster, accounts[0]);
		assert.equal(link, "reddit.com");
	})

	it("should be able to get link and owner for multiple posts", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[0]});
		await token.postLink("google.com", {from : accounts[1]});
		await token.postLink("google.com", {from : accounts[0]});
		await token.postLink("reddit.com", {from : accounts[1]});

		let [index1, poster1, link1] = await token.getLinkByIndex( 0 );
		assert.equal(index1, 0);
		assert.equal(poster1, accounts[0]);
		assert.equal(link1, "reddit.com");

		let [index2, poster2, link2] = await token.getLinkByIndex( 1 );
		assert.equal(index2, 1);
		assert.equal(poster2, accounts[1]);
		assert.equal(link2, "google.com");

		let [index3, poster3, link3] = await token.getLinkByIndex( 2 );
		assert.equal(index3, 2);
		assert.equal(poster3, accounts[0]);
		assert.equal(link3, "google.com");

		let [index4, poster4, link4] = await token.getLinkByIndex( 3 );
		assert.equal(index4, 3);
		assert.equal(poster4, accounts[1]);
		assert.equal(link4, "reddit.com");
	})

	it("should fail to get link and owner of negative index", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[0]});
		await token.postLink("google.com", {from : accounts[1]});
		await token.getLinkByIndex(-1).should.be.rejectedWith('invalid opcode');
	})

	it("should fail to get link and owner of out of bound index at border", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[0]});
		await token.postLink("google.com", {from : accounts[1]});
		await token.getLinkByIndex(2).should.be.rejectedWith('invalid opcode');
	})

	it("should fail to get link and owner of out of bound index way above", async function() {
		let token = await BackableTokenMock.new(accounts[0], 1000, accounts[1], 0);

		await token.register.sendTransaction('enodios', {from: accounts[1]});

		await token.postLink("reddit.com", {from : accounts[0]});
		await token.postLink("google.com", {from : accounts[1]});
		await token.getLinkByIndex(20000).should.be.rejectedWith('invalid opcode');
	})
})