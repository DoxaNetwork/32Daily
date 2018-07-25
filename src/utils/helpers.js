var Web3 = require('web3');
var web3 = new Web3();

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

function dayOfWeek(date) {
	const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[date.getUTCDay()];
}

function month(date) {
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	return months[date.getUTCMonth()];
}

module.exports = { ByteArrayToString, stringToChunkedArray, dayOfWeek, month };
