import { COLORS } from '../constants/colors';
import { createStyles } from '@material-ui/core/styles';
import { RouteComponentProps } from 'react-router-dom';
import { withRouter } from 'react-router';
import * as React from 'react';
import Box from '../components/layout/Box';
import HistoryList from '../components/issuer/HistoryList';
import PageBox from '../components/layout/PageBox';
import { ROLES } from '../constants/general';
import PageContainer from '../components/layout/PageContainer';
import PageTitle from '../components/layout/PageTitle';
import RoleContext from '../components/common/RoleContext';
import withStyles, { WithStyles } from '@material-ui/core/styles/withStyles';
import HistorySwapDetailsPage from './HistorySwapDetailsPage';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import * as actions from '../actions/network';
import { IAction } from '../utils/general';

const styles = createStyles({
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  boxConstraint: {
    width: '40%',
  },
  thinText: {
    color: COLORS.grey,
    fontSize: '1.5rem',
    fontWeight: 100,
    margin: '1rem 0 2rem 0',
  },
  thinSmallText: {
    color: COLORS.blue,
    fontSize: '1rem',
    fontWeight: 100,
    margin: '0.5rem 0 2rem 0',
    cursor: 'pointer',
  },
  swapNumber: {
    color: COLORS.black,
    fontSize: '3rem',
    fontWeight: 500,
    margin: '1rem 0',
  },
  boxLabelNoMargin: {
    color: COLORS.grey,
    fontSize: '1.5rem',
    fontWeight: 100,
    alignSelf: 'flex-start',
    margin: '0rem 0 1rem 0',
  },
  boxLabel: {
    color: COLORS.grey,
    fontSize: '1.5rem',
    fontWeight: 100,
    alignSelf: 'flex-start',
    margin: '2.5rem 0 1rem 0',
  },
});
interface IProps {
  initUser: () => void;
  initIssuer: () => void;
  resetSelectedTx: () => void;
}
type IPropsFinal = IProps & WithStyles<typeof styles> & RouteComponentProps<{ role: string }>;
class UserHomePage extends React.Component<IPropsFinal> {
  static contextType = RoleContext;
  state = {
    page: 1,
    selectedHistory: null,
  };
  switchTo = (role: ROLES) => {
    this.props.resetSelectedTx();
    if (this.context.theme === ROLES.ISSUER) {
      this.props.initUser();
    } else {
      this.props.initIssuer();
    }
    if (role === ROLES.USER) {
      this.context.setRole(ROLES.USER);
      this.props.history.push('/user/direct-swap');
      sessionStorage.setItem('role', 'user');
    } else {
      this.context.setRole(ROLES.ISSUER);
      this.props.history.push('/issuer/home');
      sessionStorage.setItem('role', 'issuer');
    }
  }
  setSelectedHistory = (value) => {
    this.setState({
      selectedHistory: value,
    });
  }
  goBack = () => {
    this.setState({
      page: this.state.page - 1 < 0 ? 0 : this.state.page - 1,
    });
  }
  goTo = (pg: number) => {
    this.setState({
      page: pg,
    });
  }
  next = () => {
    this.setState({
      page: this.state.page + 1 > 3 ? 3 : this.state.page + 1,
    });
  }
  render() {
    console.log('home page rendered');
    const { classes, match } = this.props;
    // const { role } = match.params;
    return (
      <>
        {this.state.page === 4 ?
          <HistorySwapDetailsPage
            currentSelectedHistory={this.state.selectedHistory}
            goBack={this.goBack}
            next={this.next}
          />
          :
          <PageBox>
            <PageTitle>
              HOME
            </PageTitle>
            <PageContainer>
              <span className={classes.boxLabelNoMargin}>Overview</span>
              <div className={classes.row}>
                <div className={classes.boxConstraint}>
                  <Box fullHeight>
                    <div className={classes.swapNumber}>
                      5
                    </div>
                    <div className={classes.thinText}>
                      Swaps today
                    </div>
                  </Box>
                </div>
                <div className={classes.boxConstraint}>
                  <Box fullHeight>
                    <div className={classes.thinText}>
                      Demo Exploration
                    </div>
                    <div
                      className={classes.thinSmallText}
                      onClick={() => {
                        this.switchTo(ROLES.USER);
                      }}
                    >
                      Make a Direct Swap >
                    </div>
                    <div
                      className={classes.thinSmallText}
                      onClick={() => {
                        this.switchTo(ROLES.ISSUER);
                      }}
                    >
                      Approve a Direct Swap >
                    </div>
                  </Box>
                </div>
              </div>
              <span className={classes.boxLabel}>In Progress</span>
              <Box>
                <HistoryList
                  inProgress
                  next={this.next}
                  goBack={this.goBack}
                  goTo={this.goTo}
                  setSelectedHistory={this.setSelectedHistory}
                />
              </Box>
              <span className={classes.boxLabel}>History</span>
              <Box>
                <HistoryList
                  next={this.next}
                  goBack={this.goBack}
                  goTo={this.goTo}
                  setSelectedHistory={this.setSelectedHistory}
                />
              </Box>
            </PageContainer>
          </PageBox>
        }
        </>
    );
  }
}
export function mapDispatchToProps(dispatch: Dispatch<IAction>) {
  return {
    initUser: () => dispatch(actions.initUser()),
    initIssuer: () => dispatch(actions.initIssuer()),
    resetSelectedTx: () => dispatch(actions.resetSelectedTx()),
  };
}
export default connect(null, mapDispatchToProps)(withRouter(withStyles(styles)(UserHomePage)));

// export default withRouter(withStyles(styles)(UserHomePage));