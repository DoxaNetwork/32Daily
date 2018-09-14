const Web3 = require('web3');
const fs = require('fs')
const web3 = new Web3();

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

function getEventsByType(events, type) {
    let matchedEvents = []
    for (let i = 0; i < events.length; i++) {
        if (events[i].event === type) {
            matchedEvents.push(events[i])
        }
    }
    return matchedEvents;
}

function recordFactory(result, freq, factoryName) {
  const events = getEventsByType(result.logs, "Deployed");
  const address = events[0].args['newContract'] 

  const dstPath = __dirname + '/../../build/factories/' + factoryName + '.json';

  let data;
  if (fs.existsSync(dstPath)) {
    data = require(dstPath);  
  } else {
    data = {}
  }
  data[freq] = address;
  fs.writeFileSync(dstPath, JSON.stringify(data, null, 2), {flag: 'w'});
}

function readFactory(freq, factoryName) {
    const path = __dirname + '/../../build/factories/' + factoryName + '.json';
    const data = require(path)
    const address = data[freq];
    return address;
}

module.exports = { 
    ByteArrayToString,
    stringToChunkedArray,
    dayOfWeek,
    month,
    recordFactory,
    getEventsByType,
    readFactory
};
