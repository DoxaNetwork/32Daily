const PostChain = artifacts.require("./PostChain.sol");

module.exports = function(deployer) {
  deployer.deploy(PostChain);
};
