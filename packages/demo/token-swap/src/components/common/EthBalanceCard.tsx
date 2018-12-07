import * as React from 'react';
import RoleContext from './RoleContext';
import * as W3 from '../../web3Exported';
import { ROLES } from '../../constants/general';
import { Paper } from '@material-ui/core';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../../actions/network';
import { IAction, toEth } from '../../utils/general';
import { IStoreState } from '../../reducers/network';
import { createStyles } from '@material-ui/core/styles';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import { SIDEBAR } from '../../constants/colors';
import Ether from '../../assets/Ethereum_logo.svg'; // tslint:disable-line:import-name

const styles = createStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',

    margin: '3em 2em 1em 2em',
    padding: '1em',
    backgroundColor: SIDEBAR.ETH_CARD.bg,
    color: SIDEBAR.ETH_CARD.textColor,
    borderRadius: '8px',
  },
  unit: {
    color: SIDEBAR.ETH_CARD.unitColor,
  },
});
interface IProps {
  web3Obj: W3.default | null;
  userEthBalance: string;
  issuerEthBalance: string;
}
class EthBalanceCard extends React.PureComponent<IProps & WithStyles<typeof styles>> {
  static contextType = RoleContext;
  render() {
    console.log(Ether);
    const { userEthBalance, issuerEthBalance, classes } = this.props;
    const format = input => toEth(this.props.web3Obj, input);
    const balance = this.context.theme === ROLES.USER ? userEthBalance : issuerEthBalance;
    return (
      <div className={classes.root}>
        <span>
          {format(balance)}
          <span className={classes.unit}> ETH</span>
        </span>
        <img src={Ether} alt="Ether"/>
      </div>
    );
  }
}
export function mapStateToProps({ network }: { network: IStoreState; }) {
  return {
    contract: network.contract,
    web3Obj: network.web3Obj,
    userEthBalance: network.userEthBalance,
    issuerEthBalance: network.issuerEthBalance,
  };
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EthBalanceCard));
