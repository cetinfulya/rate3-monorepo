import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';

class MyTable {
  constructor(prefix, name) {
    this.prefix = prefix;
    this.store = window.localStorage;
    this.tableName = name;
    this.table = null;
  }

  setItem(key, value) {
    this.store.setItem(`${this.prefix}.${key}`, JSON.stringify(value));
  }
  getItem(key) {
    return JSON.parse(this.store.getItem(`${this.prefix}.${key}`));
  }

  hasTable(name) {
    return this.getItem(name) !== null;
  }


  createTable() {
    const table = [];
    this.table = table;
    this.setItem(this.tableName, table);
    return this.table;
  }

  getTable(name) {
    if (this.getItem(name) !== null) {
      this.table = this.getItem(name);
      return this.table;
    }
    throw Error(`Table ${name} is not defined`);
  }

  saveTable() {
    this.setItem(this.tableName, this.table);
  }

  addClaim(value, type, user, verifier, status, network) {
    const claim = {
      id: `${user}.${value}`,
      value,
      type,
      user,
      verifier,
      status,
      signature: '',
      network,
    };

    const table = this.table;
    table.push(claim);
    this.table = table;
    this.saveTable();
  }

  containsClaim(userAddr, value) {
    if (this.table.length > 0) {
      return this.table.some((claim) => {return claim.id === `${userAddr}.${value}`});
    }
    // console.warn('table length is 0');
    return false;
  }

  getClaim(userAddr, value) {
    if (this.table.length > 0) {
      if (!this.containsClaim(userAddr, value)) {
        // console.error('there is no such claim');
      }
      return this.table.find((claim) => {return claim.id === `${userAddr}.${value}`});
    }
    // console.error('table length is 0');
    return this.table.find((claim) => {return claim.id === `${userAddr}.${value}`});
  }

  approveClaim(userAddr, value, signature) {
    const claimIndex = this.table.findIndex((claim) => {return claim.id === `${userAddr}.${value}`});
    this.table[claimIndex].status = PENDING_ADD;
    this.table[claimIndex].signature = signature;
    this.saveTable();
  }

  deleteClaim(userAddr, value) {
    const claimIndex = this.table.findIndex((claim) => {return claim.id === `${userAddr}.${value}`});
    this.table.splice(claimIndex, 1);
    this.saveTable();
  }
  getAllUnverifiedClaims() {
    if (this.table.length > 0) {
      return this.table.filter((claim) => { return claim.status === PENDING_REVIEW; });
    }
    // console.error('table length is 0');
    return this.table.filter((claim) => { return claim.type === 'name'; });
  }
  getAllNameClaims() {
    if (this.table.length > 0) {
      return this.table.filter((claim) => { return claim.type === 'name'; });
    }
    // console.error('table length is 0');
    return this.table.filter((claim) => { return claim.type === 'name'; });
  }
  getAllAddressClaims() {
    if (this.table.length > 0) {
      return this.table.filter((claim) => {return claim.type === 'address'; });
    }
    // console.error('table length is 0');
    return this.table.filter((claim) => { return claim.type === 'address'; });
  }
  getAllSocialIdClaims() {
    if (this.table.length > 0) {
      return this.table.filter((claim) => { return claim.type === 'socialId'; });
    }
    // console.error('table length is 0');
    return this.table.filter((claim) => { return claim.type === 'socialId'; });
  }
}

export default MyTable;
