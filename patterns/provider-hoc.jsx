// The provider pattern
import React, { Fragment } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';


/**
 * There's another way to create consumers of the Component.Context
 * By making a HOC (Higher-Order Component) that will wrap passed Component
 * inside Consumer
 */

const CheckboxContext = React.createContext();

export default class Checkbox extends React.Component {
  static Consumer = CheckboxContext.Consumer;

  check = () => this.setState(
    ({ checked }) => ({ checked: !checked }),
    () => this.props.onToggle(this.state.checked),
  );

  state = { checked: false, check: this.check };

  render() {
    return <CheckboxContext.Provider value={this.state} {...this.props} />;
  }
}

// HOC to create CheckboxContext consumers
const withCheckbox = (Component) => {
  // Create a wrapper component. Ref is passed by React.forwardRef()
  function Wrapper(props, ref) {
    // Wrapper component returns Checkbox.Consumer
    return (
      <Checkbox.Consumer>
        {/* Pass CheckboxContext as prop to wrapped component */}
        {/* pass ref down to the Component */}
        {context => <Component {...props} checkbox={context} ref={ref} />}
      </Checkbox.Consumer>
    );
  }

  // Specify displaying name for wrapped component
  Wrapper.displayName = `withCheckbox(${Component.displayName
    || Component.name})`;

  // hoist all static functions from Component to new Wrapped component
  return hoistNonReactStatics(React.forwardRef(Wrapper), Component);
};

const Layer1 = () => <Layer2 />;
const Layer2 = withCheckbox(({ checkbox: { checked } }) => (
  <Fragment>
    {checked ? 'The button is on' : 'The button is off'}
    <Layer3 />
  </Fragment>
));

const Layer3 = () => <Layer4 />;
const Layer4 = withCheckbox(({ checkbox: { checked, check } }) => (
  <button type="button" onClick={check}>{`Checkbox is ${checked}`}</button>
));

export function Usage() {
  const onToggle = (...args) => console.log('onToggle', ...args);

  return (
    <Checkbox onToggle={onToggle}>
      <Layer1 />
    </Checkbox>
  );
}
