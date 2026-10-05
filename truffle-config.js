require('babel-register');
require('babel-polyfill');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');

// Secrets live in git-ignored files; only the network being used needs them.
const readSecret = (file) =>
  fs.existsSync(file)
    ? fs
        .readFileSync(file)
        .toString()
        .trim()
    : '';

const sepoliaProvider = () => {
  const mnemonic = readSecret('.secret');
  const infuraKey = readSecret('.infuraKey');
  if (!mnemonic || !infuraKey) {
    throw new Error('Sepolia deploy needs .secret (mnemonic) and .infuraKey');
  }
  return new HDWalletProvider(
    mnemonic,
    `https://sepolia.infura.io/v3/${infuraKey}`
  );
};

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*', // Match any network id
    },

    sepolia: {
      provider: sepoliaProvider,
      network_id: 11155111,
      gas: 4500000,
      gasPrice: 20000000000,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },

  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      // pinned locally; truffle 5.1 can't reach the current solc download host
      version: './node_modules/solc',
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: 'petersburg',
    },
  },

  //etherscan API key
  api_keys: {
    etherscan: readSecret('.ethKey'),
  },
  // plugin for verification
  plugins: ['truffle-plugin-verify'],
};

//truffle test

// call console - truffle console
// get contract - await TestToken.deployed()

// to compile - truffle compile
// to deploy - truffle migrate --reset
// to deploy - truffle migrate --network sepolia --reset
// to verify - truffle run verify Contract --network sepolia
