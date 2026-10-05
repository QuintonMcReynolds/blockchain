import React, { useState } from 'react';
import classes from './Header.module.css';
import icon from '../assets/icon.png';
import { shortAddress } from '../format';

const Header = ({ wallet, account, network, supported, onConnect }) => {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(account).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <header className={classes.header}>
      <div className={classes.brand}>
        <img src={icon} alt="" className={classes.logo} />
        <span>TST Staking</span>
      </div>

      <div className={classes.actions}>
        {network && (
          <span className={classes.network}>
            <span
              className={`${classes.dot} ${supported ? classes.ok : classes.warn}`}
            />
            {network.name}
          </span>
        )}

        {wallet === 'connected' ? (
          <button
            className={classes.account}
            onClick={copyAddress}
            title={account}
          >
            {copied ? 'Copied' : shortAddress(account)}
          </button>
        ) : (
          <button
            className={classes.connect}
            onClick={onConnect}
            disabled={wallet === 'missing' || wallet === 'checking'}
          >
            {wallet === 'checking' ? 'Checking wallet…' : 'Connect wallet'}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
