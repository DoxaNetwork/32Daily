// const toAscii = require('../src/utils/helpers')
function toAscii(hex) {
    let zeroPaddedString = web3.toAscii(hex);
    return zeroPaddedString.split("\u0000")[0];
}

const ContentPool = artifacts.require("./ContentPool.sol");

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ContentPool', function(accounts) {
	let pool;
	const string = 'Applebees';

	before("should store an item", async function() {
		pool = await ContentPool.new();
		await pool.assignHub(accounts[0], {from : accounts[0]});

		await pool.newContent(accounts[0], string);
	})

	it("should retrieve by index", async function() {
		const [address, content] = await pool.getItem(0);
		assert.equal(toAscii(content), string);
	});

	it("should retrieve by content", async function() {
		const index = await pool.getIndex(string);
		assert.equal(index.toNumber(), 0);

		const [address, content] = await pool.getItem(index);
		assert.equal(toAscii(content), string);
	});

	it("should return the count of items stored in this version", async function() {
		const length = await pool.poolLength();
		assert.equal(length, 1);
	});

	it("should clear the pool", async function () {
		await pool.clear();

		const length = await pool.poolLength();
		assert.equal(length, 0);

		await pool.getItem(0).should.be.rejectedWith('revert');;
	});

	it("should retrieve past content after clearing the pool", async function () {
		await pool.clear();

		const length = await pool.poolLength();
		assert.equal(length, 0);

		const [address, content] = await pool.getPastItem(0,0);
		assert.equal(toAscii(content), string);
	});
})