import React, { useState } from 'react';
import card from './Card.module.css';
import classes from './Staking.module.css';
import { formatToken } from '../format';

const Staking = ({
  poolLabel,
  apy,
  userBalance,
  myStake,
  ready,
  pending,
  wallet,
  onConnect,
  onStake,
  onUnstake,
}) => {
  const [amount, setAmount] = useState('');

  const value = Number(amount);
  const overBalance = value > Number(userBalance);
  const canStake = ready && amount !== '' && value > 0 && !overBalance;
  const canUnstake = ready && Number(myStake) > 0;

  const submit = async (event) => {
    event.preventDefault();
    if (!canStake) return;
    const ok = await onStake(amount);
    if (ok) setAmount('');
  };

  let hint = `${formatToken(apy / 365, 3)}% daily · rewards paid in TST`;
  if (overBalance) hint = 'Amount exceeds your wallet balance';

  return (
    <form className={card.card} onSubmit={submit}>
      <div className={classes.head}>
        <h2 className={card.title}>Stake · {poolLabel}</h2>
        <button
          type="button"
          className={classes.balance}
          onClick={() => setAmount(userBalance)}
          disabled={!ready || Number(userBalance) === 0}
        >
          Balance {formatToken(userBalance)} <strong>MAX</strong>
        </button>
      </div>

      <label
        className={`${classes.field} ${overBalance ? classes.fieldError : ''}`}
      >
        <input
          className={classes.input}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0.0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-label="Amount to stake"
        />
        <span className={classes.token}>TST</span>
      </label>

      <p className={`${classes.hint} ${overBalance ? classes.hintError : ''}`}>
        {hint}
      </p>

      {wallet === 'connected' ? (
        <div className={classes.buttons}>
          <button
            type="submit"
            className={`${card.button} ${card.primary}`}
            disabled={!canStake}
          >
            {pending ? <span className={card.spinner} /> : null}
            {pending || 'Stake'}
          </button>
          <button
            type="button"
            className={`${card.button} ${card.secondary}`}
            onClick={onUnstake}
            disabled={!canUnstake}
          >
            Unstake all
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`${card.button} ${card.primary} ${classes.full}`}
          onClick={onConnect}
          disabled={wallet !== 'disconnected'}
        >
          Connect wallet to stake
        </button>
      )}
    </form>
  );
};

export default Staking;
