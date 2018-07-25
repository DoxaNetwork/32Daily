// const toAscii = require('../src/utils/helpers')
function toAscii(hex) {
    let zeroPaddedString = web3.toAscii(hex);
    return zeroPaddedString.split("\u0000")[0];
}

function stringToChunkedArray(string) {
    return string.match(/.{1,32}/g);
}

function ByteArrayToString(array) {
    // should use reduce here instead
    let output = '';
    for (let i = 0; i < array.length; i++) {
        output += toAscii(array[i]);
    }
    return output;
}

const ContentPool = artifacts.require("./ContentPool.sol");

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('ContentPool', function(accounts) {
    let pool;
    const string = 'ApplebeesApplebeesApplebees';
    const text = 'I took a SUPER big poop, but even that was not enough. I had to turn myself inside out to empty these bowels. And again, nothing could be done to save me.'

    before("should store an item", async function() {
        pool = await ContentPool.new();
        await pool.assignHub(accounts[0], {from : accounts[0]});

        await pool.newContent(accounts[0], stringToChunkedArray(text));
    })

    it("should retrieve by index", async function() {
        const [address, content] = await pool.getItem(0);
        assert.equal(content.length, 5);
        assert.equal(toAscii(content[0]), stringToChunkedArray(text)[0]);
        assert.equal(toAscii(content[1]), stringToChunkedArray(text)[1]);
        assert.equal(toAscii(content[2]), stringToChunkedArray(text)[2]);
        assert.equal(toAscii(content[3]), stringToChunkedArray(text)[3]);
        assert.equal(toAscii(content[4]), stringToChunkedArray(text)[4]);
        assert.equal(ByteArrayToString(content), text);
    });

    it("should retrieve by content", async function() {
        const index = await pool.getIndex(string);
        assert.equal(index.toNumber(), 0);

        const [address, content] = await pool.getItem(index);
        assert.equal(ByteArrayToString(content), text);
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
        assert.equal(ByteArrayToString(content), text);
    });
})