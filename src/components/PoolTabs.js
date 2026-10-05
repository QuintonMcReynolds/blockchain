import React from 'react';
import classes from './PoolTabs.module.css';
import { formatToken } from '../format';

const PoolTabs = ({ pools, apy, active, onChange }) => (
  <div className={classes.tabs} role="tablist">
    {pools.map((pool, index) => (
      <button
        key={pool.key}
        role="tab"
        aria-selected={active === index}
        className={`${classes.tab} ${active === index ? classes.active : ''}`}
        onClick={() => onChange(index)}
      >
        <span className={classes.label}>{pool.label}</span>
        <span className={classes.apy}>{formatToken(apy[index], 2)}% APY</span>
      </button>
    ))}
  </div>
);

export default PoolTabs;
