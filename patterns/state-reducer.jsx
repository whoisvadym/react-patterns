import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Problem:
 *  Using "render-props" pattern along gives developers an ability to control
 *  over how component should be displayed. But what if state changes should also
 *  be controlled by end user of the component?
 *
 * Solution:
 *  "State reducer" pattern brings the control over component state changes to developer.
 */


/**
 * Function that executes all provided functions if they exist (is not undefined)
 * @param  {...any} fns - functions to be executed
 */
const callAll = (...fns) => (...args) => fns.forEach(fn => fn && fn(...args));

export default class Checkbox extends Component {
    static defaultProps = {
      onCheck: () => {},
      onReset: () => {},
      children: () => {},
      stateReducer: (state, changes) => changes,
      initialChecked: false,
    };

    static propTypes = {
      onCheck: PropTypes.func,
      onReset: PropTypes.func,
      children: PropTypes.func,
      stateReducer: PropTypes.func,
      initialChecked: PropTypes.bool,
    }

    static stateChangeTypes = {
      check: '__check__',
      reset: '__reset__',
    }

    // in order to avoid duplication
    // all initial values for state are stored in the variable
    initialState = {
      checked: this.props.initialChecked,
    }

    // assign state to its initial value
    state = this.initialState;

    /**
     * @func getCheckProps
     * @returns object that combines external and internal states and actions
     * This particular function returns functionality responsible for checkbox button
     */
    getCheckProps = ({ onClick, ...props }) => ({
      // NOTE!
      // React will pass Event object to callbacks by default
      // and in order to prevent that, therefore to fulfil type property with default value
      onClick: callAll(onClick, () => this.check()),
      ...props,
    });

    /**
     * @func getStateAndHelpers
     * @return <object> all public states
     * States and actions that share the same meaning are combined and
     * returned as a function e.g. getCheckButtonProps
     */
    getStateAndHelpers() {
      const { checked } = this.state;
      return {
        checked,
        reset: this.reset,
        getCheckButtonProps: this.getCheckProps,
      };
    }

    // action to change checked state
    check = ({ type = Checkbox.stateChangeTypes.check } = {}) => {
      const { onCheck } = this.props;

      return this.internalSetState(
        // update "checked" state to its opposite value
        ({ checked }) => ({ type, checked: !checked }),
        // call onCheck function from props
        () => onCheck(),
      );
    };

    // action to reset state to initial value
    reset = () => {
      const { onReset } = this.props;

      // populate changes with reset type
      return this.internalSetState(
        { ...this.initialState, type: Checkbox.stateChangeTypes.reset },
        () => onReset(),
      );
    }

    // this custom internalSetState() method should be called in component
    // instead of default "setState()". Note: DO NOT use setState in the component if
    // you need outer component to reflect this component state changes
    internalSetState(changes, callback) {
      // handle setState first
      this.setState((state) => {
        const { stateReducer } = this.props;
        const changesObject = typeof changes === 'function' ? changes(state) : changes;

        // pass current state and incomming changes to a stateReducer
        const reducedChanges = stateReducer(state, changesObject) || {};

        // extract all changes but type related to avoid unecessary rerendering
        const { type, ...onlyChanges } = reducedChanges;

        // prevent re-renders if there's no changes made
        return Object.keys(onlyChanges).length ? onlyChanges : null;
      }, callback);
    }

    /**
     * @func render
     * @returns Children, assuming it's a function and pass all state and
     * actions (helpers) to that function
     * This is the most important part of "render-props" pattern.
     */
    render() {
      const { children } = this.props;
      return children(this.getStateAndHelpers());
    }
}

// Basic Usage example of "render-props" pattern
// eslint-disable-next-line react/no-multi-comp
export class Usage extends Component {
  static defaultProps = {
    initialChecked: false,
    onCheck: () => console.log('onCheck'),
    onClick: () => console.log('onCustomClick'),
    onReset: () => console.log('onReset'),
  };

  initialState = {
    clicks: 0,
  }

  state = this.initialState;

  handleCheck = () => {
    const { onCheck } = this.props;
    const { clicks } = this.state;
    if (clicks < 4) { this.setState({ clicks: clicks + 1 }, onCheck); }
  }

  handleReset = () => {
    const { onReset } = this.props;
    this.setState(this.initialState, onReset);
  }

  checkboxStateReducer = (state, changes) => {
    const { clicks } = this.state;

    if (clicks >= 4) {
      return { ...changes, checked: false };
    }

    return changes;
  }

  render() {
    const {
      initialChecked, onClick,
    } = this.props;

    const { clicks } = this.state;
    return (
      <Checkbox
        // pass custom state reducer to Checkbox component
        stateReducer={this.checkboxStateReducer}
        initialChecked={initialChecked}
        onCheck={this.handleCheck}
        onReset={this.handleReset}
      >
        {({ checked, getCheckButtonProps, reset }) => (
          <div>
            <span>{checked ? 'is checked' : 'is unchecked'}</span>
            { clicks >= 4 ? <div>You clicked too much, sir</div> : null}
            { clicks >= 0 ? (<div>{`Total clicks: ${clicks}`}</div>) : null }
            <button type="button" {...getCheckButtonProps({ onClick })}>{!checked ? 'on' : 'off'}</button>
            <button type="button" onClick={() => reset()}>RESET</button>
          </div>
        )}
      </Checkbox>
    );
  }
}
