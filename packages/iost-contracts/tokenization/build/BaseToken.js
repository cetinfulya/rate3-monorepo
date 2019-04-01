"use strict";
class BaseToken {
  // Execute once when contract is packed into a block.
  init() {
    storage.put('deployed', 'f');
    storage.put('paused', 't');
    storage.put('issuer', tx.publisher);
  }

  // One-time deploy token.
  // No effect if deploy has been called before.
  deploy(name, symbol, decimals) {
    this._checkIssuer();
    // Check if token is deployed already.
    if (storage.get('deployed') === 'f') {
      let issuer = storage.get('issuer');
      
      storage.put('deployed', 't');
      storage.put('name', name);
      storage.put('symbol', symbol);
      storage.put('totalSupply', '0');
      storage.mapPut('balances', issuer, '0');

      blockchain.receipt(JSON.stringify(
        { name, symbol, decimals, issuer }
      ));
    } else {
      throw new Error('ALREADY_DEPLOYED');
    }
  }

  pause() {
    this._checkIssuer();
    if (storage.get('paused') === 't') {
      throw new Error('ALREADY_PAUSED');
    }
    storage.put('paused', 't');
    blockchain.receipt(JSON.stringify(
      { action: 'pause' }
    ));
  }

  unpause() {
    this._checkIssuer();
    if (storage.get('paused') === 'f') {
      throw new Error('ALREADY_NOT_PAUSED');
    }
    storage.put('paused', 'f');
    blockchain.receipt(JSON.stringify(
      { action: 'unpause' }
    ));
  }


  issue(to, amount, ethConversionId) {
    this._checkIssuer();
    this._checkPause();
    this._checkIdValid(to);
    this._checkBlacklist(to);

    let issueAmount = new BigNumber(amount);
    if (!issueAmount.isInteger()) {
      throw new Error('INTEGER_VALUE_REQUIRED');
    }

    if (issueAmount.isNegative()) {
      throw new Error('NON_NEGATIVE_VALUE_REQUIRED');
    }

    let currentAmount = storage.mapGet('balances', to);
    if (currentAmount === null) {
      currentAmount = new BigNumber(0);
    } else {
      currentAmount = new BigNumber(currentAmount);
    }

    let currentSupply = storage.get('totalSupply');
    if (currentSupply === null) {
      throw new Error('NULL_TOTAL_SUPPLY');
    } else {
      currentSupply = new BigNumber(currentSupply);
    }

    let newAmount = currentAmount.plus(issueAmount);
    let newSupply = currentSupply.plus(issueAmount);

    if (newSupply.isGreaterThan(new BigNumber(2).exponentiatedBy(256).minus(1))) {
      throw new Error('UINT256_OVERFLOW');
    }

    storage.mapPut('balances', to, newAmount.toString());
    storage.put('totalSupply', newSupply.toString());

    blockchain.receipt(JSON.stringify(
      { action: 'issue', to, amount, ethConversionId }
    ));
    return JSON.stringify({ to, amount, ethConversionId });
  }

  transfer(from, to, amount, memo) {
    if (!blockchain.requireAuth(from, 'active')) {
      throw new Error('PERMISSION_DENIED');
    }

    this._checkPause();
    this._checkIdValid(from);
    this._checkIdValid(to);
    this._checkBlacklist(from);

    let sendAmount = new BigNumber(amount);
    if (!sendAmount.isInteger()) {
      throw new Error('INTEGER_VALUE_REQUIRED');
    }

    if (sendAmount.isNegative()) {
      throw new Error('NON_NEGATIVE_VALUE_REQUIRED');
    }

    let currentFromAmount = storage.mapGet('balances', from);
    if (currentFromAmount === null) {
      currentFromAmount = new BigNumber(0);
    } else {
      currentFromAmount = new BigNumber(currentFromAmount);
    }

    let currentToAmount = storage.mapGet('balances', to);
    if (currentToAmount === null) {
      currentToAmount = new BigNumber(0);
    } else {
      currentToAmount = new BigNumber(currentToAmount);
    }

    if (sendAmount.isGreaterThan(currentFromAmount)) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    let newFromAmount = currentFromAmount.minus(sendAmount);
    let newToAmount = currentToAmount.plus(sendAmount);

    if (newToAmount.isGreaterThan(new BigNumber(2).exponentiatedBy(256).minus(1))) {
      throw new Error('UINT256_OVERFLOW');
    }

    storage.mapPut('balances', from, newFromAmount.toString());
    storage.mapPut('balances', to, newToAmount.toString());

    blockchain.receipt(JSON.stringify(
      { action: 'transfer', from, to, amount, memo }
    ));
    return JSON.stringify({ from, to, amount, memo });
  }

  burn(from, amount) {
    if (!blockchain.requireAuth(from, 'active')) {
      throw new Error('PERMISSION_DENIED');
    }

    this._checkPause();
    this._checkIdValid(from);
    this._checkBlacklist(from);

    let burnAmount = new BigNumber(amount);
    if (!burnAmount.isInteger()) {
      throw new Error('INTEGER_VALUE_REQUIRED');
    }

    if (burnAmount.isNegative()) {
      throw new Error('NON_NEGATIVE_VALUE_REQUIRED');
    }

    let currentFromAmount = storage.mapGet('balances', from);
    if (currentFromAmount === null) {
      currentFromAmount = new BigNumber(0);
    } else {
      currentFromAmount = new BigNumber(currentFromAmount);
    }

    let currentSupply = storage.get('totalSupply');
    if (currentSupply === null) {
      throw new Error('NULL_TOTAL_SUPPLY');
    } else {
      currentSupply = new BigNumber(currentSupply);
    }

    if (burnAmount.isGreaterThan(currentFromAmount)) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    let newFromAmount = currentFromAmount.minus(amount);
    let newSupply = currentSupply.minus(amount);

    storage.mapPut('balances', from, newFromAmount.toString());
    storage.put('totalSupply', newSupply.toString());

    blockchain.receipt(JSON.stringify(
      { action: 'burn', from, amount }
    ));
    return JSON.stringify({ from, amount });
  }

  convertToERC20(from, amount, ethAddress) {
    this._checkPause();
    this._checkIdValid(from);
    this._checkEthAddressValid(ethAddress);

    this.burn(from, amount);

    blockchain.receipt(JSON.stringify(
      { action: 'convert', from, amount, ethAddress }
    ));
    return JSON.stringify({ from, amount, ethAddress });
  }

  blacklist(id, bool) {
    this._checkPause();
    this._checkIssuer();
    this._checkIdValid(id);

    if (bool) {
      storage.mapPut('blacklist', id, 't');
    } else {
      storage.mapPut('blacklist', id, 'f');
    }

    blockchain.receipt(JSON.stringify(
      { action: 'blacklist', id, bool }
    ));
  }

  can_update(data) {
    let issuer = storage.get('issuer');
    return blockchain.requireAuth(issuer, 'active');
  }

  _checkIssuer() {
    let issuer = storage.get('issuer');
    if (!blockchain.requireAuth(issuer, 'active')) {
      throw new Error('PERMISSION_DENIED');
    }
  }

  _checkPause() {
    let paused = storage.get('paused');
    if (paused === 't') {
      throw new Error('CONTRACT_PAUSED');
    }
  }

  _checkBlacklist(id) {
    let blacklisted = storage.mapGet('blacklist', id);
    if (blacklisted === 't') {
      throw new Error('ID_BLACKLISTED');
    }
  }

  _checkIdValid(id) {
    if (block.number === 0) {
      return;
    }
    if (id.length < 5 || id.length > 11) {
      throw new Error('INVALID_ID_LENGTH');
    }
    if (id.startsWith('Contract')) {
      throw new Error('ID_IS_CONTRACT');
    }
    for (let i in id) {
      let ch = id[i];
      if (!(ch >= 'a' && ch <= 'z' || ch >= '0' && ch <= '9' || ch === '_')) {
        throw new Error('INVALID_ID_CHAR');
      }
    }
    let account = storage.globalMapGet('auth.iost', 'auth', id);
    if (account === null) {
      throw new Error('ACCOUNT_DOES_NOT_EXIST');
    }
  }

  _checkEthAddressValid(address) {
    if (address.length != 42) {
      throw new Error('INVALID_ETH_ADDRESS_LENGTH');
    }

    if (!address.startsWith('0x')) {
      throw new Error('INVALID_ETH_ADDRESS_PREFIX');
    }

    address = address.replace('0x','');
    address = address.toLowerCase();

    for (let i in address) {
      let ch = address[i];
      if (!(ch >= 'a' && ch <= 'f' || ch >= '0' && ch <= '9')) {
        throw new Error('INVALID_ETH_ADDRESS_CHAR');
      }
    }
    return true;
  };
}
module.exports = BaseToken;
