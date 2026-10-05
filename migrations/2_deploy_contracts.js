const TestToken = artifacts.require('TestToken');
const TokenStaking = artifacts.require('TokenStaking');

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(TestToken);
  const testToken = await TestToken.deployed();

  await deployer.deploy(TokenStaking, testToken.address);
  const tokenStaking = await TokenStaking.deployed();

  // fund the staking contract with 500k TST for rewards and the faucet
  await testToken.transfer(tokenStaking.address, '500000000000000000000000');

  // local chains have spare accounts; give the second one 1,000 TST to test with
  if (accounts[1]) {
    await testToken.transfer(accounts[1], '1000000000000000000000');
  }
};
