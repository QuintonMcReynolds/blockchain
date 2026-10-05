# Requirements

    ## Node Version
        16 | 18 | 20
    ## OS
        Windows 10 | Mac OS
    ## Browser
        Chrome | Edge

# Running instructions

- Install project packages (`npm install`)
- Start project (`npm run start`)

# Deploying the contracts

Local (Ganache on port 7545): `npx truffle migrate --reset`

Sepolia:

1. Create two git-ignored files in the project root:
   - `.secret` — the 12-word mnemonic of a deployer wallet funded with Sepolia ETH
   - `.infuraKey` — an Infura project key
2. `npx truffle migrate --network sepolia --reset`

The new addresses are written to `src/abis/`; commit them so the frontend picks up the network.
