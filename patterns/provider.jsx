import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

/**
 * Problem:
 *  There's a problem called "props-drilling" problem. It can be described
 *  by following example:
 *
 *  Image having a several layers of the component.
 *  Passing props required by the deepest component can become messy really fast:
 *
 * Layer1 component doesn't actually need props itself. It passes them down to Layer2 component
 * const Layer1 = props => <Layer2 {...props} />;
 *
 * Layer2 component doesn't need props neither. It just passes it down to Layer3 component
 * const Layer2 = props => <Layer3 {...props} />;
 *
 * Layer3 component requires propVariable1 and propVariable2 properties
 * to render a component that relies on them
 * const Layer3 = ({ propVariable1, propVariable2 }) => (
 *  <ComponentThatRequires prop1={propVariable1} prop2={propVariable2} />
 * );
 *
 * Solution:
 *  "Provider pattern" shows combination of both "render-props" and "context" patterns.
 *
 */

const CheckboxContext = React.createContext();

// It's safer to check if required context exists in Consumer
function Consumer(props) {
  return (
    <CheckboxContext.Consumer {...props}>
      {(context) => {
        // if there's no context: that probably means Consumer was
        // rendered outside of the Provider
        if (!context) throw new Error('Checkbox.Consumer should be written inside the Checkbox.Provider');
        // if everything is ok - render child as a function
        return props.children(context);
      }}
    </CheckboxContext.Consumer>
  );
}

export default class Checkbox extends Component {
  // to couple consumers with its provider component
  static Consumer = Consumer;

  static On = ({ children }) => <Consumer>{({ checked }) => (checked ? children : null) }</Consumer>

  static Off = ({ children }) => (
    <Consumer>{({ checked }) => (!checked ? children : null) }</Consumer>
  );

  static defaultProps = {
    onCheck: () => {},
  };

  static propTypes = {
    onCheck: PropTypes.func,
  };


  check = () => {
    this.setState(
      ({ checked }) => ({ checked: !checked }),
      () => this.props.onCheck(),
    );
  };

  // store actions in state to avoid unecessary re-renders
  state = {
    checked: false,
    check: this.check,
  };

  render() {
    // separate children from props.
    const { children, ...restProps } = this.props;
    // if children passed was a function - execute it with state as param
    // otherwise assign the whole children value to ui
    const ui = typeof children === 'function' ? children(this.state) : children;
    return (
      // spread props without children to the provider
      // passing props to provider pass them to Checkbox component itself
      <CheckboxContext.Provider value={this.state} {...restProps}>
        {/* Render children */}
        {ui}
      </CheckboxContext.Provider>
    );
  }
}

const Layer1 = () => <Layer2 />;

// Since Consumer follows Render Props pattern
// It accepts render function as a child
const Layer2 = () => (
  <Fragment>
    <div>
      <Checkbox.On><h5>The checkbox is on</h5></Checkbox.On>
      <Checkbox.Off><h5>The checkbox is off</h5></Checkbox.Off>
      <Layer3 />
    </div>
  </Fragment>
);

const Layer3 = () => (
  <Checkbox.Consumer>
    {({ checked, check }) => (
      <button type="button" onClick={check}>
        {!checked ? 'on' : 'off'}
      </button>
    )}
  </Checkbox.Consumer>
);

const Span = ({ color, children }) => <span style={{ color }}>{children}</span>;

Span.propTypes = {
  color: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
};

export function Usage({
  handleCheck = (...args) => { console.log('onCheck... ', ...args); },
}) {
  return (
    <Checkbox onCheck={handleCheck}>
      {({ checked }) => (
        <div>
          <div>{checked ? <Span color="green">Checked</Span> : <Span color="red">Unchecked</Span>}</div>
          <Layer1 />
        </div>
      )}
    </Checkbox>
  );
}

Usage.propTypes = {
  handleCheck: PropTypes.func.isRequired,
};
