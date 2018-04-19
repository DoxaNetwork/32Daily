var Web3 = require('web3');
var web3 = new Web3();

function toAscii(hex) {
    let zeroPaddedString = web3.toAscii(hex);
    return zeroPaddedString.split("\u0000")[0];
}

module.exports = toAscii;
