import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';

import { identityBlue, backdropColor, modalShadow } from './../constants/colors';
import leftArrow from '../assets/leftArrow.svg';
import rightArrow from '../assets/rightArrow.svg';

const styles = (theme) => {
  return ({
    modal: {
      position: 'absolute',
      top: 'calc(50% - 12em)',
      left: 'calc(50% - 17.5em)',
      width: '35rem',
      height: '25rem',
      '&:focus': {
        outline: 'none',
      },
    },
    paper: {
      width: '100%',
      height: '100%',
      backgroundColor: identityBlue,
      boxShadow: modalShadow,
      borderRadius: '0.5em 0.5em 0 0',
    },
    content: {
      color: 'white',
      width: 'calc(100% - 4em)',
      height: 'calc(100% - 2.5em)',
      display: 'flex',
      padding: '2em 2em 0.5em 2em',
    },
    footer: {
      backgroundColor: 'white',
      width: '35rem',
      height: '3rem',
      borderRadius: '0 0 0.5em 0.5em',
      display: 'flex',
      flexDirection: 'row-reverse',
    },
    backdrop: {
      backgroundColor: backdropColor,
    },
    buttonText: {
      color: identityBlue,
      fontSize: 'bold',
    },
    arrow: {
      alignSelf: 'center',
    },
    image: {
      width: '50%',
    },
  });
};


const InstructionModal = (props) => {
  const { classes } = props;
  return (
    <Modal
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={props.open}
      onClose={props.onClose}
      BackdropProps={{
        classes: {
          root: classes.backdrop,
        },
      }}
      // onClose={this.handleClose}
    >
      <div className={classes.modal}>
        <div className={classes.paper}>
          <div className={classes.content}>
            <div style={{ cursor: 'pointer' }} className={classes.arrow} onClick={props.handleBack}>
              {props.activeStep > 0 && <img className={classes.image} src={leftArrow} alt="" />}
            </div>
            {props.children}
            <div style={{ cursor: 'pointer' }} className={classes.arrow} onClick={props.handleNext}>
              {props.activeStep < props.maxSteps - 1 && <img className={classes.image} src={rightArrow} alt="" />}
            </div>
          </div>
        </div>
        <div className={classes.footer}>
          {props.activeStep < props.maxSteps - 1 ?
            <Button
              size="small"
              onClick={props.handleNext} 
              disabled={props.activeStep >= props.maxSteps - 1}
              classes={{
                text: classes.buttonText,
              }}
            >
              Next
            </Button> :
            <Button
              size="small"
              onClick={props.onClose}
              classes={{
                text: classes.buttonText,
              }}
            >
              Get Started
            </Button>
          }
        </div>
      </div>
    </Modal>
  );
};

InstructionModal.propTypes = {
  
};

export default withStyles(styles)(InstructionModal);
