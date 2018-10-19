const PostChainFactory = artifacts.require("./PostChainFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(PostChainFactory);
};