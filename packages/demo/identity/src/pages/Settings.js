import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { translate } from 'react-i18next';
import ChevronLeft from '@material-ui/icons/ChevronLeftRounded';
import IconButton from '@material-ui/core/IconButton';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { inject, observer } from 'mobx-react';

import AccountTypeDropdown from '../components/AccountTypeDropdown';
import { identityHeavyGrey, disabledBackgroundColor } from '../constants/colors';
import ReOnboardModal from '../components/ReOnboardModal';

const styles = (theme) => {
  return ({
    title: {
      letterSpacing: '0.02em',
      display: 'flex',
      alignItems: 'center',
      left: '-1.5em',
      position: 'relative',
      justifyContent: 'flex-start',
    },
    label: {
      fontSize: '1.5em',
      lineHeight: '1.5em',
    },
    descriptionBox: {
      width: '40vw',
      maxWidth: '30em',
      fontSize: '1.2em',
      lineHeight: '1.55em',
      fontWeight: '400',
      marginBottom: '5em',
    },
    root: {
      width: '100%',
    },
    indicator: {
      backgroundColor: identityHeavyGrey,
    },
    primaryColor: {
      color: `${identityHeavyGrey} !important`,
    },
    greyBack: {
      padding: '0.5em',
      paddingLeft: '1em',
      borderRadius: '0.5em',
      fontWeight: 'bold',
      color: identityHeavyGrey,
      backgroundColor: disabledBackgroundColor,
      overflowWrap: 'break-word',
      '& p': {
        overflowWrap: 'break-word',
      },
    },
    disabledTab: {
      pointerEvents: 'auto !important',
      cursor: 'no-drop !important',
      color: '#e3e7ed !important',
    },
    noMargin: {
      marginBlockStart: '0em',
      marginBlockEnd: '0em',
    },
  });
};
@inject('RootStore') @observer
class Settings extends React.Component {
  state = { value: 0 };
  
  componentDidMount() {
    window.analytics.page('settings');
    this.props.RootStore.setStartInitNetworkTrue();
    if (!this.props.RootStore.commonStore.getIsUser()) {
      if (window.localStorage.accountType === 'fixed') {
        this.props.RootStore.userStore.changeToFixedAccount();
        this.props.RootStore.initNetwork();
      } else if (window.localStorage.accountType === 'metamask') {
        this.props.RootStore.userStore.changeToMetaMaskAccount();
        this.props.RootStore.initNetwork();
      } else {
        this.props.RootStore.initNetwork();
      }
    } else {
      this.props.RootStore.userStore.changeToFixedAccount();
      this.props.RootStore.initNetwork();
    }
  }
  handleChange = (event, value) => {
    this.setState({ value });
  }
  render() {
    const { classes, t } = this.props;
    const WalletAddress = (props) => {
      if (!props.RootStore.commonStore.getIsUser()) {
        return <p className={classes.noMargin}>0xd102503E987a6402A1E0b220369ea4A4Bce911E8</p>;
      }
      if (!props.onFixedAccount) {
        return <p className={classes.noMargin}>{props.userAddress}</p>;
      }
      return <p className={classes.noMargin}>{props.RootStore.userStore.fixedUserAddr}</p>;
    };
    return (
      <div>
        <ReOnboardModal open={this.props.RootStore.reonboardModalIsShowing} />
        <h1 className={classes.title}>
          <IconButton
            onClick={() => { this.props.history.goBack(); }}
          >
            <ChevronLeft className={classes.label} />
          </IconButton>
        
          <div>{t('Settings')}</div>
        </h1>
        <div className={classes.descriptionBox}>
          <div className={classes.root}>
            <Tabs
              value={this.state.value}
              onChange={this.handleChange}
              textColor="primary"
              fullWidth
              classes={{ indicator: classes.indicator, root: classes.tabs }}
            >
              <Tab classes={{ textColorPrimary: classes.primaryColor }} value={0} label="ETH Wallet" />
              <Tab classes={{ textColorPrimary: classes.primaryColor, disabled: classes.disabledTab }} disabled={this.props.RootStore.commonStore.getIsUser()} value={1} label="Public Keys" />
            </Tabs>
            {this.state.value === 0 &&
              <div style={{ paddingTop: '1.5em' }}>
                <AccountTypeDropdown
                  variant={this.props.RootStore.commonStore.getIsUser() ? 'user' : 'verifier'}
                  isOnSidebar
                  isUser={this.props.RootStore.commonStore.getIsUser()}
                />
                <p>Account Name</p>
                <div className={classes.greyBack}>{this.props.RootStore.commonStore.getIsUser() ? 'User' : 'Verifier' }</div>
                <p>Wallet Address</p>
                <div className={classes.greyBack}>
                  <WalletAddress
                    {...this.props}
                    onFixedAccount={this.props.RootStore.userStore.isOnFixedAccount}
                    userAddress={this.props.RootStore.commonStore.metamaskAccount}
                  />
                </div>
              </div>
            }

            {this.state.value === 1 &&
              <div style={{ paddingTop: '1em' }}>
                <p>Claim Signing Key</p>
                <div className={classes.greyBack}>0x05223E84769d33e75e692856216Ee881008d81FF</div>
              </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

Settings.propTypes = {
  
};

export default translate('general')(withStyles(styles)(Settings));
