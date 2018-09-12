var VotesFactory = artifacts.require("./VotesFactory.sol");


function getEventsByType(events, type) {
    let matchedEvents = []
    for (let i = 0; i < events.length; i++) {
        if (events[i].event === type) {
            matchedEvents.push(events[i])
        }
    }
    return matchedEvents;
}


module.exports = function(deployer) {
  // let factory;
  deployer.deploy(VotesFactory);
}
//   .then(function() {
//     return VotesDBFactory.deployed();
//   })
//   .then(function(instance){
// 
//     factory = instance;
//     return factory.newVotesDB();
//   }).then(function(result) {
// 
//     console.log("=============================================")
//     const events = getEventsByType(result.logs, "Deployed");
//     const address = events[0].args['newContract']
//     console.log(address);
//     console.log("=============================================")
//     return factory.newVotesDB();
//   }).then(function(address) {
// 
//     console.log(address)
//     return factory.newVotesDB();
//   }).then(function(address) {
// 
//     console.log(address)
//     return factory.newVotesDB();
//   }).then(function(address) {
// 
//     console.log(address)
//     return factory.newVotesDB();
//   }).then(function(address) {
//     console.log(address)
//   })
//   // deployer.deploy(Votes);
// };
