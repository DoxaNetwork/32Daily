import Web3 from 'web3'

let getWeb3 = new Promise(function(resolve, reject) {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener('load', function() {
        var results

        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (typeof window.web3 !== 'undefined') {
            
            console.log('Injected web3 detected.');

            // note: this will break when metamask upgrades to web3 1.0.0
            window.web3.version.getNetwork((e, networkId) => {

                if (networkId == 3) {
                    // Use Mist/MetaMask's provider.
                    var web3 = new Web3(window.web3.currentProvider)

                    results = { web3, web3Browser: true, canSendTransactions: true }
                    resolve(results)
                } else {
                    // Fallback to infura if web3 injection is on wrong network.
                    var provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/f6NOUQqHkXc64NJgRwvj')
                    var web3 = new Web3(provider)

                    console.log('Injected web3 detected on wrong network: ' + networkId + ' ...using infura');
                    results = { web3, web3Browser: true, canSendTransactions: false }
                    resolve(results)
                }
            })

        } else {
            // Fallback to infura if no web3 injection.
            var provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/f6NOUQqHkXc64NJgRwvj')
            var web3 = new Web3(provider)

            console.log('No web3 instance injected, using infura');
            results = { web3, web3Browser: false, canSendTransactions: false }
            resolve(results)
        }
    })
})

export default getWeb3
