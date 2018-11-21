const Web3 = require('web3')
const web3 = new Web3();

function toAscii(hex) {
    let zeroPaddedString = web3.utils.hexToAscii(hex);
    return zeroPaddedString.split("\u0000")[0];
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

module.exports = { 
    dayOfWeek,
    month,
    getEventsByType,
    toAscii
};
