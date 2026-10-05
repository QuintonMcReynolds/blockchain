import React from 'react';
import card from './Card.module.css';
import classes from './AdminTesting.module.css';
import { formatToken, shortAddress } from '../format';

const AdminTesting = ({
  network,
  stakingAddress,
  contractBalance,
  poolLabel,
  isOwner,
  ready,
  onClaim,
  onRedistribute,
}) => (
  <details className={`${card.card} ${classes.panel}`}>
    <summary className={classes.summary}>
      <span>Testnet tools</span>
      <span className={classes.badge}>Testing only</span>
    </summary>

    <div className={classes.body}>
      <div className={classes.actions}>
        <button
          className={`${card.button} ${card.secondary}`}
          onClick={onClaim}
          disabled={!ready}
        >
          Claim 1,000 TST
        </button>
        <button
          className={`${card.button} ${card.secondary}`}
          onClick={onRedistribute}
          disabled={!ready || !isOwner}
          title={isOwner ? '' : 'Only the contract owner can distribute rewards'}
        >
          Distribute {poolLabel.toLowerCase()} rewards
        </button>
      </div>
      {!isOwner && (
        <p className={classes.note}>
          Reward distribution is restricted to the contract owner.
        </p>
      )}

      <dl className={classes.meta}>
        <div>
          <dt>Network</dt>
          <dd>{network ? `${network.name} · ${network.id}` : '—'}</dd>
        </div>
        <div>
          <dt>Staking contract</dt>
          <dd title={stakingAddress || ''}>
            {stakingAddress ? shortAddress(stakingAddress) : '—'}
          </dd>
        </div>
        <div>
          <dt>Contract TST balance</dt>
          <dd>{formatToken(contractBalance, 2)}</dd>
        </div>
      </dl>
    </div>
  </details>
);

export default AdminTesting;
