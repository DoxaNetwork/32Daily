const fs = require('fs');

function recordFactory(result, freq) {
  const events = getEventsByType(result.logs, "Deployed");
  const postChain = events[0].args['postChain'];
  const votes = events[0].args['votes'];
  const history = events[0].args['history'];
  const hub = events[0].args['hub'];

  const dstPath = __dirname + '/../build/factories/freqs.json';

  let data;
  if (fs.existsSync(dstPath)) {
    data = require(dstPath);  
  } else {
    data = {}
  }
  data[freq] = {postChain, votes, history, hub};
  fs.writeFileSync(dstPath, JSON.stringify(data, null, 2), {flag: 'w'});

  return hub;
}

function readFactory(freq) {
    const path = __dirname + '/../build/factories/freqs.json';
    const data = require(path)
    const address = data[freq];
    return address;
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
    recordFactory,
    readFactory,
};
