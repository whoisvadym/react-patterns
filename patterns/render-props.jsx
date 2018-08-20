import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Problem:
 *  Sometimes developers lack of ability to customize the output (render) of the Component
 *
 * Solution:
 *  "Render prop" pattern brings the control over component output to the
 *  developer. The idea of this pattern is
 *  to take a function as children component and give it access to all internal states and actions.
 */

/**
 * Function that executes all provided functions if they exist (is not undefined)
 * @param  {...any} fns - functions to be executed
 */
const callAll = (...fns) => (...args) => fns.forEach(fn => fn && fn(...args));

export default class Checkbox extends Component {
    static defaultProps = {
      onCheck: () => {},
      children: () => {},
    };

    static propTypes = {
      onCheck: PropTypes.func,
      children: PropTypes.func,
    }

    // set checked state to false by default
    state = {
      checked: false,
    };

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
  onCheck = () => console.log('checked'),
  onClick = () => console.log('check button was clicked'),
}) {
  return (
    <Checkbox onCheck={onCheck}>
      {({ checked, getCheckButtonProps }) => (
        <div>
          <span>{checked ? 'is checked' : 'is unchecked'}</span>
          <button type="button" {...getCheckButtonProps({ onClick })}>{!checked ? 'on' : 'off'}</button>
        </div>
      )}
    </Checkbox>
  );
}
