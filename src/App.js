import React, { useState, useEffect, useRef, useCallback } from 'react';
import Web3 from 'web3';
import classes from './App.module.css';
import TestToken from './abis/TestToken.json';
import TokenStaking from './abis/TokenStaking.json';
import Header from './components/Header';
import PoolTabs from './components/PoolTabs';
import Staking from './components/Staking';
import Position from './components/Position';
import AdminTesting from './components/AdminTesting';
import Toast from './components/Toast';
import { formatToken, errorMessage } from './format';

// Both pools live in one contract; only the method names differ.
const POOLS = [
  {
    key: 'default',
    label: 'Default pool',
    stake: 'stakeTokens',
    unstake: 'unstakeTokens',
    redistribute: 'redistributeRewards',
  },
  {
    key: 'custom',
    label: 'Custom pool',
    stake: 'customStaking',
    unstake: 'customUnstake',
    redistribute: 'customRewards',
  },
];

const NETWORK_NAMES = {
  1: 'Ethereum',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
  1337: 'Localhost',
  5777: 'Ganache',
  11155111: 'Sepolia',
};

const networkName = (id, fallback) => NETWORK_NAMES[id] || fallback || `Chain ${id}`;

const SUPPORTED_NETWORKS = Object.keys(TokenStaking.networks)
  .filter((id) => TestToken.networks[id])
  .map((id) => `${networkName(id)} (${id})`);

const EMPTY_DATA = {
  userBalance: '0',
  contractBalance: '0',
  totalStaked: ['0', '0'],
  myStake: ['0', '0'],
  apy: [0, 0],
  owner: null,
};

const App = () => {
  // checking | missing | disconnected | connected
  const [wallet, setWallet] = useState('checking');
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [supported, setSupported] = useState(true);
  const [data, setData] = useState(EMPTY_DATA);
  const [pool, setPool] = useState(0);
  const [pending, setPending] = useState(null);
  const [toast, setToast] = useState(null);

  const web3Ref = useRef(null);
  const contractsRef = useRef({ token: null, staking: null });

  const showToast = (type, message) => setToast({ type, message, id: Date.now() });

  const loadData = useCallback(async (from) => {
    const web3 = web3Ref.current;
    const { token, staking } = contractsRef.current;
    if (!web3 || !token || !staking || !from) return;

    const toEth = (value) => web3.utils.fromWei(value.toString(), 'ether');
    const [
      userBalance,
      contractBalance,
      stake,
      customStake,
      total,
      customTotal,
      defaultAPY,
      customAPY,
      owner,
    ] = await Promise.all([
      token.methods.balanceOf(from).call(),
      token.methods.balanceOf(staking._address).call(),
      staking.methods.stakingBalance(from).call(),
      staking.methods.customStakingBalance(from).call(),
      staking.methods.totalStaked().call(),
      staking.methods.customTotalStaked().call(),
      staking.methods.defaultAPY().call(),
      staking.methods.customAPY().call(),
      staking.methods.owner().call(),
    ]);

    // Contract stores the daily rate in thousandths of a percent.
    const toApy = (raw) => (Number(raw) / 1000) * 365;

    setData({
      userBalance: toEth(userBalance),
      contractBalance: toEth(contractBalance),
      totalStaked: [toEth(total), toEth(customTotal)],
      myStake: [toEth(stake), toEth(customStake)],
      apy: [toApy(defaultAPY), toApy(customAPY)],
      owner,
    });
  }, []);

  const connect = useCallback(
    async (prompt) => {
      if (!window.ethereum) {
        setWallet('missing');
        return;
      }

      try {
        const accounts = await window.ethereum.request({
          method: prompt ? 'eth_requestAccounts' : 'eth_accounts',
        });
        if (!accounts || accounts.length === 0) {
          setWallet('disconnected');
          setAccount(null);
          return;
        }

        const web3 = new Web3(window.ethereum);
        web3Ref.current = web3;
        const from = accounts[0];
        setAccount(from);
        setWallet('connected');

        const networkId = await web3.eth.net.getId();
        const networkType = await web3.eth.net.getNetworkType();
        setNetwork({ id: networkId, name: networkName(networkId, networkType) });

        const tokenData = TestToken.networks[networkId];
        const stakingData = TokenStaking.networks[networkId];
        if (!tokenData || !stakingData) {
          contractsRef.current = { token: null, staking: null };
          setSupported(false);
          setData(EMPTY_DATA);
          return;
        }

        contractsRef.current = {
          token: new web3.eth.Contract(TestToken.abi, tokenData.address),
          staking: new web3.eth.Contract(TokenStaking.abi, stakingData.address),
        };
        setSupported(true);
        await loadData(from);
      } catch (error) {
        if (error.code === 4001) {
          setWallet('disconnected');
        } else {
          showToast('error', errorMessage(error));
        }
      }
    },
    [loadData]
  );

  useEffect(() => {
    connect(false);

    if (!window.ethereum || !window.ethereum.on) return undefined;
    const onAccounts = () => connect(false);
    const onChain = () => window.location.reload();
    window.ethereum.on('accountsChanged', onAccounts);
    window.ethereum.on('chainChanged', onChain);
    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', onAccounts);
        window.ethereum.removeListener('chainChanged', onChain);
      }
    };
  }, [connect]);

  // Runs one or more wallet transactions in order, waiting for each receipt.
  const runTx = async (steps, successMessage) => {
    try {
      for (const step of steps) {
        setPending(step.label);
        await step.send();
      }
      showToast('success', successMessage);
      return true;
    } catch (error) {
      showToast('error', errorMessage(error));
      return false;
    } finally {
      setPending(null);
      loadData(account).catch(() => {});
    }
  };

  const ready = wallet === 'connected' && supported && !pending;
  const { token, staking } = contractsRef.current;
  const activePool = POOLS[pool];

  const stake = (amount) => {
    const wei = web3Ref.current.utils.toWei(amount, 'ether');
    return runTx(
      [
        {
          label: 'Approving…',
          send: () =>
            token.methods.approve(staking._address, wei).send({ from: account }),
        },
        {
          label: 'Staking…',
          send: () => staking.methods[activePool.stake](wei).send({ from: account }),
        },
      ],
      `Staked ${formatToken(amount)} TST in the ${activePool.label.toLowerCase()}`
    );
  };

  const unstake = () =>
    runTx(
      [
        {
          label: 'Unstaking…',
          send: () => staking.methods[activePool.unstake]().send({ from: account }),
        },
      ],
      `Unstaked ${formatToken(data.myStake[pool])} TST`
    );

  const claim = () =>
    runTx(
      [{ label: 'Claiming…', send: () => staking.methods.claimTst().send({ from: account }) }],
      'Claimed 1,000 TST'
    );

  const redistribute = () =>
    runTx(
      [
        {
          label: 'Distributing…',
          send: () => staking.methods[activePool.redistribute]().send({ from: account }),
        },
      ],
      'Rewards distributed to stakers'
    );

  const isOwner =
    !!account && !!data.owner && account.toLowerCase() === data.owner.toLowerCase();

  return (
    <div className={classes.shell}>
      <Header
        wallet={wallet}
        account={account}
        network={network}
        supported={supported}
        onConnect={() => connect(true)}
      />

      <section className={classes.hero}>
        <h1>Stake TST, earn daily yield</h1>
        <p>
          Lock TestToken into a pool and receive rewards every distribution.
          Unstake whenever you like.
        </p>
      </section>

      {wallet === 'missing' && (
        <div className={classes.banner}>
          <span>No Ethereum wallet detected. Install MetaMask to use this app.</span>
          <a
            className={classes.bannerButton}
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get MetaMask
          </a>
        </div>
      )}

      {wallet === 'connected' && !supported && (
        <div className={classes.banner}>
          <span>
            The staking contracts aren't deployed on {network && network.name}. Switch
            your wallet to {SUPPORTED_NETWORKS.join(', ')}.
          </span>
        </div>
      )}

      <PoolTabs pools={POOLS} apy={data.apy} active={pool} onChange={setPool} />

      <div className={classes.grid}>
        <Staking
          key={activePool.key}
          poolLabel={activePool.label}
          apy={data.apy[pool]}
          userBalance={data.userBalance}
          myStake={data.myStake[pool]}
          ready={ready}
          pending={pending}
          wallet={wallet}
          onConnect={() => connect(true)}
          onStake={stake}
          onUnstake={unstake}
        />
        <Position
          myStake={data.myStake[pool]}
          apy={data.apy[pool]}
          userBalance={data.userBalance}
          poolTotal={data.totalStaked[pool]}
        />
      </div>

      <AdminTesting
        network={network}
        stakingAddress={staking ? staking._address : null}
        contractBalance={data.contractBalance}
        poolLabel={activePool.label}
        isOwner={isOwner}
        ready={ready}
        onClaim={claim}
        onRedistribute={redistribute}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};

export default App;
