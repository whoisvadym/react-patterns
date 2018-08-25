import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Problem:
 *  Sometimes components state should rely on value from the props
 *  It is useful to sync two or more components' state values
 *
 * Solution:
 *  "Controlled-props" pattern allows developers to create "controlled" state values by passing
 *  them through props.
 */


export default class Checkbox extends Component {
  state = {
    checked: false,
  }

  static propTypes = {
    onStateChange: PropTypes.func,
  }

  static defaultProps = {
    onStateChange: () => {},
  }

  // return state with all controlled props (if there're any)
  // getState can receive state as param
  getState(state = this.state) {
    return Object.entries(state).reduce(
      (combinedState, [stateKey, stateValue]) => {
      // for each state object key check if its controlled (is in props)
        if (this.isControlled(stateKey)) {
        // if key exists in props - it is controlled
        // assign the value from props
          return { [stateKey]: this.props[stateKey], ...combinedState };
        }

        // otherwise assign the value from state
        return { [stateKey]: stateValue, ...combinedState };
      }, {},
    );
  }

  // function that is responsible for checking whether prop is controlled
  isControlled = prop => (this.props[prop] !== undefined);

  check = () => {
    this.internalSetState(({ checked }) => ({ checked: !checked }));
  }

  // 1. gets combined state from this.getState();
  // 2. collects non-controlled changes
  // 3. sets new state
  // 4. execute onStateChange prop in setState callback onStateChanges(changes, state)
  internalSetState(changes, callback) {
    let allChanges;
    this.setState((state) => {
      // get combined state from
      const combinedState = this.getState(state);
      const changesObject = typeof changes === 'function' ? changes(combinedState) : changes;

      // save changes to allChanges object
      allChanges = changesObject;

      // get all NON-CONTROLLED changes
      const nonControlledChanges = Object.entries(changesObject).reduce(
        (newChanges, [changesKey, changesValue]) => {
          if (!this.isControlled(changesKey)) {
            return { [changesKey]: changesValue, ...newChanges };
          }

          return newChanges;
        }, {},
      );

      // prevent unnessessary rerenders by returning null if there were no uncontrolled changes
      return Object.keys(nonControlledChanges).length ? nonControlledChanges : null;
    },
    () => {
      const { onStateChange } = this.props;

      // pass changes and state to callback from props
      onStateChange(allChanges, this.getState());

      // execute setState callback
      if (typeof callback === 'function') callback();
    });
  }

  render() {
    // NOTE: we need to use custom state getter to receive valid info
    // (read: this.getState() is the only source of truth)
    const { checked } = this.getState();
    return <button onClick={this.check} type="button">{!checked ? 'on' : 'off'}</button>;
  }
}


// eslint-disable-next-line react/no-multi-comp
export class Usage extends Component {
  state = {
    bothOn: false,
  }

  handleStateChanges = ({ checked }) => {
    this.setState({ bothOn: checked });
  }

  render() {
    const { bothOn } = this.state;
    return (
      <div>
        <Checkbox checked={bothOn} onStateChange={this.handleStateChanges} />
        <Checkbox checked={bothOn} onStateChange={this.handleStateChanges} />
      </div>
    );
  }
}
