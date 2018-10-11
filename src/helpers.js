const fs = require('fs');

function recordFactory(result, freq, factoryName) {
  const events = getEventsByType(result.logs, "Deployed");
  const address = events[0].args['newContract'] 

  const dstPath = __dirname + '/../build/factories/' + factoryName + '.json';

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
    const path = __dirname + '/../build/factories/' + factoryName + '.json';
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
