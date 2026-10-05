export const formatToken = (value, maxDecimals = 4) => {
  const num = Number(value);
  if (!isFinite(num)) return '0';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
};

export const shortAddress = (address) =>
  address ? `${address.slice(0, 6)}…${address.slice(-4)}` : '';

// MetaMask / web3 errors are long and nested; pull out the readable part.
export const errorMessage = (error) => {
  if (!error) return 'Transaction failed';
  if (error.code === 4001) return 'Transaction rejected in wallet';
  const message = error.message || String(error);
  const revert = message.match(/revert(?:ed)?:?\s*([^"\n]+)/i);
  if (revert) return revert[1].trim();
  return message.split('\n')[0].slice(0, 140);
};
