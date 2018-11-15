import Web3 from 'web3'

let getWeb3 = new Promise(function(resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function() {
    var results
    var web3 = window.web3

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
      // Use Mist/MetaMask's provider.
      // web3 = new Web3(web3.currentProvider)
      
      console.log('Injected web3 detected.');

      web3.version.getNetwork((e, networkId) => {

        if (networkId == 3) {
          results = { web3, networkId, web3Browser: true }
          resolve(results)
        } else {
          var provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/f6NOUQqHkXc64NJgRwvj')
          web3 = new Web3(provider)

          console.log('Injected web3 detected on wrong network: ' + networkId + ' ...using infura');
          web3.version.getNetwork((e, networkId) => {
            results = { web3, networkId, web3Browser: true }
            resolve(results)
          })
        }
      })

    } else {
      // Fallback to infura if no web3 injection.
      var provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/f6NOUQqHkXc64NJgRwvj')
      web3 = new Web3(provider)

      console.log('No web3 instance injected, using infura');
      web3.version.getNetwork((e, networkId) => {
        results = { web3, networkId, web3Browser: false }
        resolve(results)
      })
    }
  })
})

export default getWeb3
