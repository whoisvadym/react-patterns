import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Problem:
 *  Sometimes developers want to get control over what the initial state of the component should be.
 *  Along with that it's always useful to have an action to reset component state to
 *  its initial values.
 *
 * Solution:
 *  "State initializer" pattern brings the control over component initial state to the developer.
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
      initialChecked: false,
    };

    static propTypes = {
      onCheck: PropTypes.func,
      onReset: PropTypes.func,
      children: PropTypes.func,
      initialChecked: PropTypes.bool,
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
      onClick: callAll(onClick, this.check),
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
    check = () => {
      const { onCheck } = this.props;

      this.setState(
        // update "checked" state to its opposite value
        ({ checked }) => ({
          checked: !checked,
        }),
        // call onCheck function from props
        () => onCheck(),
      );
    };

    // action to reset state to initial value
    reset = () => {
      const { onReset } = this.props;

      this.setState(this.initialState, () => onReset());
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
export function Usage({
  initialChecked = false,
  onCheck = () => console.log('onCheck'),
  onClick = () => console.log('onCustomClick'),
  onReset = () => console.log('onReset'),
}) {
  return (
    <Checkbox initialChecked={initialChecked} onCheck={onCheck} onReset={onReset}>
      {({ checked, getCheckButtonProps, reset }) => (
        <div>
          <span>{checked ? 'is checked' : 'is unchecked'}</span>
          <button type="button" {...getCheckButtonProps({ onClick })}>{!checked ? 'on' : 'off'}</button>
          <button type="button" onClick={() => reset()}>RESET</button>
        </div>
      )}
    </Checkbox>
  );
}
