import React from 'react';
import card from './Card.module.css';
import classes from './Position.module.css';
import { formatToken } from '../format';

const Stat = ({ label, value, unit, highlight }) => (
  <div className={classes.stat}>
    <dt>{label}</dt>
    <dd className={highlight ? classes.highlight : ''}>
      {value}
      {unit && <span>{unit}</span>}
    </dd>
  </div>
);

const Position = ({ myStake, apy, userBalance, poolTotal }) => {
  const dailyReward = (Number(myStake) * apy) / 36500;
  const share =
    Number(poolTotal) > 0 ? (Number(myStake) / Number(poolTotal)) * 100 : 0;

  return (
    <section className={card.card}>
      <h2 className={card.title}>Your position</h2>
      <dl className={classes.stats}>
        <Stat label="Staked" value={formatToken(myStake)} unit="TST" />
        <Stat
          label="Est. daily reward"
          value={`+${formatToken(dailyReward)}`}
          unit="TST"
          highlight
        />
        <Stat label="Wallet balance" value={formatToken(userBalance)} unit="TST" />
        <Stat label="Share of pool" value={formatToken(share, 2)} unit="%" />
      </dl>
      <div className={classes.footer}>
        <span>Total staked in pool</span>
        <strong>{formatToken(poolTotal, 2)} TST</strong>
      </div>
    </section>
  );
};

export default Position;
