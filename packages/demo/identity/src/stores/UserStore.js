import {
  configure,
  observable,
  action,
  computed,
  runInAction,
  when,
} from 'mobx';
import Web3 from 'web3';
import Identity from '../utils/Identity';
import { PENDING_REVIEW, PENDING_ADD, VERIFIED } from '../constants/general';

configure({ enforceActions: 'always' }); // don't allow state modifications outside actions

const social1 = new Identity(0, 'S1234568G');
const social2 = new Identity(1, 'G01293849I');
const social3 = new Identity(1, 'S09898376Y');
social2.approveIdentity('0x4d3a5de2bfa0bb3d35fecd82d6d3c1deb396580f');
social3.approveIdentity('0x4d3a5de2bfa0bb3d35fecd82d6d3c1deb396580f');
social3.addIdentity('0x825e1e0c57700b327dff98d2b04b17ba8fe3d2ea729acd79a4d2fe1a2912935b');
class UserStore {
  /* JSDOC: MARK START OBSERVABLE */
  @observable userModalIsShowing = false;
  @observable userModalHasBeenViewed = false;
  @observable modalPage: Number = 0;
  @observable identityNames: Array = [];
  @observable identityAddresses: Array = [{ id: 1, status: PENDING_REVIEW, value: '001 Changi Road' }];
  @observable identitySocialIds: Array = [social1, social2, social3];

  @observable registerModalIsShowing = false;
  @observable registerSuccessModalIsShowing = false;
  // Modal Form
  @observable verifierList: Array = ['Pikachu', 'Eevee', 'Squirtle', 'Snorlax'];
  @observable verifierSelected: String = '_placeholder_';
  @observable formTextInputValue: String = '';

  // Wallet properties
  @observable currentNetwork: String = 'Detecting Network...';
  @observable isMetaMaskLoggedIn: Boolean = false;
  @observable isOnFixedAccount: Boolean = false;

  @observable fixedUserAcctNetwork: String = 'Ropsten';
  /* JSDOC: MARK END OBSERVABLE */

  constructor(rootStore) {
    this.rootStore = rootStore;
  }

  @computed get isMetaMaskEnabled() {
    return (typeof window.web3 !== 'undefined');
  }

  @action
  changeFixedUserAcctNetwork(v) {
    this.fixedUserAcctNetwork = v;
  }

  @action
  initMetamaskNetwork() {
    if (this.isOnFixedAccount) {
      this.currentNetwork = 'user is on a fixed network';
      return;
    }
    if (!this.isMetaMaskEnabled) {
      this.currentNetwork = 'Please enable MetaMask browser extension';
      return;
    }
    this.rootStore.commonStore.completeSetupWalletProgress(0);
    
    const web3 = new Web3(window.web3.currentProvider);
    window.web3 = web3;
    web3.eth.getAccounts((err, accounts) => {
      runInAction(() => {
        if (err != null) console.error('An error occurred while detecting MetaMask login status');
        else if (accounts.length === 0) console.log('User is not logged in to MetaMask');
        else {
          this.isMetaMaskLoggedIn = true;
          this.rootStore.commonStore.completeSetupWalletProgress(1);
        }
      });
    });
    web3.eth.net.getNetworkType((err, network) => {
      runInAction(() => {
        switch (network) {
          case 'ropsten':
            this.currentNetwork = 'Ropsten';
            this.rootStore.commonStore.completeSetupWalletProgress(2);
            return;
          case 'rinkeby':
            this.currentNetwork = 'Rinkeby';
            this.rootStore.commonStore.completeSetupWalletProgress(2);
            return;
          case 'kovan':
            this.currentNetwork = 'Kovan';
            this.rootStore.commonStore.completeSetupWalletProgress(2);
            return;
          default:
            this.currentNetwork = 'Others';
        }
      });
    });
  }

  getFormTextInputValue() {
    return this.formTextInputValue;
  }
  getVerifierSelected() {
    return this.verifierSelected;
  }
  getVerifierList() {
    return this.verifierList;
  }

  getModalPage() {
    return this.modalPage;
  }

  getIdentityNames() {
    return this.identityNames;
  }
  getIdentityAddresses() {
    return this.identityAddresses;
  }
  getIdentitySocialIds() {
    return this.identitySocialIds;
  }

  getUserModalIsShowing() {
    return this.userModalIsShowing;
  }

  getRegisterModalIsShowing() {
    return this.registerModalIsShowing;
  }
  getRegisterSuccessModalIsShowing() {
    return this.registerSuccessModalIsShowing;
  }
  @action
  addToNames(name) {
    const id = this.identityNames.length;
    const newIdentityName = {
      id,
      status: PENDING_ADD,
      value: name,
    };
    this.identityNames.push(newIdentityName);
  }

  @action
  openModal() {
    this.userModalIsShowing = true;
  }

  @action
  closeModal() {
    this.userModalIsShowing = false;
    console.log(this.userModalIsShowing);
  }

  @action
  handleModalIndexChange(step) {
    this.modalPage = step;
  }

  @action
  handleModalNext() {
    this.modalPage += 1;
  }
  @action
  handleModalBack() {
    this.modalPage -= 1;
  }
  @action
  openRegisterModal() {
    this.registerModalIsShowing = true;
  }
  @action
  closeRegisterModal() {
    this.registerModalIsShowing = false;
  }
  @action
  openRegisterSuccessModal() {
    this.registerSuccessModalIsShowing = true;
  }
  @action
  closeRegisterSuccessModal() {
    this.registerSuccessModalIsShowing = false;
  }
  @action
  setVerifierSelected(v) {
    this.verifierSelected = v;
  }
  @action
  setFormTextInputValue(v) {
    this.formTextInputValue = v;
  }
}
export default UserStore;
