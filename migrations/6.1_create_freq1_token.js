var TokenFactory = artifacts.require("./TokenFactory.sol");


function getEventsByType(events, type) {
    let matchedEvents = []
    for (let i = 0; i < events.length; i++) {
        if (events[i].event === type) {
            matchedEvents.push(events[i])
        }
    }
    return matchedEvents;
}

const fs = require('fs')

module.exports = function(deployer) {
  let factory;
  TokenFactory.deployed()
  .then(function(instance) {
    return instance.newContract();
  })
  .then(function(result) {
    const events = getEventsByType(result.logs, "Deployed");
    const address = events[0].args['newContract'] 

    const dstPath = __dirname + '/../build/factories/' + 'TokenFactory' + '.json';
    let data;
    if (fs.existsSync(dstPath)) {
      data = require(dstPath);  
    } else {
      data = {}
    }
    data['freq1'] = address;
    fs.writeFileSync(dstPath, JSON.stringify(data, null, 2), {flag: 'w'});
  })
}
