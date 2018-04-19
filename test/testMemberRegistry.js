const toAscii = require('../src/utils/helpers')

const MemberRegistry = artifacts.require("./MemberRegistry.sol");

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();


contract('MemberRegistry', function(accounts) {
	let registry;

	before("it should store a member", async function() {
		registry = await MemberRegistry.new();
		await registry.createMember(accounts[0], 'enodios');
	})

	it("should return member count", async function() {
		result = await registry.memberCount();
		assert.equal(result.toNumber(), 1);
	})

	it("should return member by index", async function() {
		const [name, owner, elected] = await registry.memberList(0);
		assert.equal(toAscii(name), 'enodios');
	})

	it("should return index by address", async function() {
		index = await registry.addressMap(accounts[0]);
		assert.equal(index, 0);
	})
})