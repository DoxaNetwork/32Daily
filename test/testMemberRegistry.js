const bs58 = require('bs58');

function toAscii(hex) {
    let zeroPaddedString = web3.toAscii(hex);
    return zeroPaddedString.split("\u0000")[0];
}

function getBytes32FromIpfsHash(ipfsListing) {
    return "0x" + bs58.decode(ipfsListing).slice(2).toString('hex');
}

function getIpfsHashFromBytes32(bytes32Hex) {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = "1220" + bytes32Hex.slice(2)
  const hashBytes = Buffer.from(hashHex, 'hex');
  const hashStr = bs58.encode(hashBytes)
  return hashStr
}

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
        await registry.create('enodios', getBytes32FromIpfsHash('QmPnR6VMMA6mhCZ51giueyNZML3KQTuX4ZYjVKpus2L4DK'));
    })

    it("should return member by address", async function() {
        const [owner, name, profileIPFS, exiled] = await registry.get(accounts[0]);
        assert.equal(owner, accounts[0]);
        assert.equal(toAscii(name), 'enodios');
        assert.equal(getIpfsHashFromBytes32(profileIPFS), 'QmPnR6VMMA6mhCZ51giueyNZML3KQTuX4ZYjVKpus2L4DK');
        assert.equal(exiled, false);
    })

    it("should not allow a duplicate username", async function() {
        await registry.create('enodios', getBytes32FromIpfsHash('QmPnR6VMMA6mhCZ51giueyNZML3KQTuX4ZYjVKpus2L4DK')).should.be.rejectedWith('revert');;
    })

    it("should set proxy address", async function() {
        await registry.setProxy(accounts[1]);

        // make sure accounts[0] still owns this ID
        const [owner, name, profileIPFS, exiled] = await registry.get(accounts[0]);
        assert.equal(owner, accounts[0]);
        assert.equal(toAscii(name), 'enodios');

        // make sure accounts[1] now also owns this ID
        const [owner2, name2, profileIPFS2, exiled2] = await registry.get(accounts[1]);
        assert.equal(owner2, accounts[0]);
        assert.equal(toAscii(name2), 'enodios');
    })

    it("should update profile", async function() {
        await registry.setProfile(getBytes32FromIpfsHash('QmNpmisubpw7okMgTBUYpbwFRZu78SDYXZjEcfKdainMgb'));
        const [owner, name, profileIPFS, exiled] = await registry.get(accounts[0]);
        assert.equal(getIpfsHashFromBytes32(profileIPFS), 'QmNpmisubpw7okMgTBUYpbwFRZu78SDYXZjEcfKdainMgb');
    })

    it("should update profile for proxied address", async function() {
        const [owner, name, profileIPFS, exiled] = await registry.get(accounts[1]);
        assert.equal(getIpfsHashFromBytes32(profileIPFS), 'QmNpmisubpw7okMgTBUYpbwFRZu78SDYXZjEcfKdainMgb');
    })

    it("should exile member", async function() {
        await registry.exile(accounts[0]);

        // make sure accounts[0] is exiled
        const [owner, name, profileIPFS, exiled] = await registry.get(accounts[0]);
        assert.equal(exiled, true);
    })

    it("should exile member for proxied address", async function() {
        // make sure accounts[1] is also exiled
        const [owner2, name2, profileIPFS2, exiled2] = await registry.get(accounts[1]);
        assert.equal(exiled2, true);
    })
})