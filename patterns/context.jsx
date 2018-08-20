import React, { Component } from "react";

/**
 * Problem:
 * Sometimes child components should be able to get control of parent functionality (props, methods, etc.)
 * The straighforward solution would be passing shared functionality of the component directly to its child:
 *
 * render() {
 *   return (
 *       React.Children.map(this.props.children, (child) => React.cloneElement(child, { checked: this.state.checked, check: this.check }))
 *   );
 * }
 *
 * The problem is that we're passing needed functionality directly to the FIRST DESCENDANT of the component.
 * That means it won't work if we would decide to wrap it's child that requires functionality:
 * <Checkbox>
 *   <ComponentThatReliesOnCheckboxPropsAndAction />
 *   <div>
 *       <ComponentThatReliesOnCheckboxPropsAndAction1 />
 *   </div>
 * </Checkbox>
 * In example above <div>...</div> child will gain required for <ComponentThatReliesOnCheckboxPropsAndAction1> component functionality of our Checkbox
 * This will cause an unwanted behavior
 *
 * Solution:
 * To pass our props down to components that need it and AREN'T FIRST DESCENDANTS we can use a React Context API: https://reactjs.org/docs/context.html
 *
 * In example below we:
 *  1. Create context for our component
 *  2. For convenience create a HOC for creating context consumers (optional)
 *  3. Create components that relie on Checkbox functionality and receive it from context
 *
 */

// Create CheckBoxContext
const CheckBoxContext = React.createContext();

// Create HOC that helps create checkbox context consumers
function CheckBoxConsumer(props) {
  return (
    <CheckBoxContext.Consumer>
      {context => {
        // Throw an error if required context was not found to make sure we render context consumers
        // only within context provider e.g. within <Checkbox></Checkbox>
        if (!context)
          throw new Error(
            "CheckboxContextConsumer was rendered outside of it's provider"
          );
        return props.children(context);
      }}
    </CheckBoxContext.Consumer>
  );
}

export default class Checkbox extends Component {
  // <Checkbox.On> component will render its children only if checkbox is checked
  static On = function({ children }) {
    return (
      <CheckBoxConsumer>
        {({ checked }) => (checked ? children : null)}
      </CheckBoxConsumer>
    );
  };

  // <Checkbox.Off> component will render its children only if checkbox is unchecked
  static Off = function({ children }) {
    return (
      <CheckBoxConsumer>
        {({ checked }) => (checked ? null : children)}
      </CheckBoxConsumer>
    );
  };

  // <Checkbox.Button> component is toggling Checkbox state on|off
  static Button = function() {
    return (
      <CheckBoxConsumer>
        {({ check }) => <button onClick={check}>Check</button>}
      </CheckBoxConsumer>
    );
  };

  state = {
    checked: false,
    check: this.check.bind(this)
  };

  check() {
    this.setState(
      ({ checked }) => ({ checked: !checked }),
      () => {
        this.props.onCheck(this.state.checked);
      }
    );
  }
  render() {
    return (
      <CheckBoxContext.Provider value={this.state}>
        {this.props.children}
      </CheckBoxContext.Provider>
    );
  }
}

export function Usage({
  onCheck = () => {
    console.log("checked");
  }
}) {
  return (
    <Checkbox onCheck={onCheck}>
      <Checkbox.On>ON</Checkbox.On>
      <Checkbox.Off>OFF</Checkbox.Off>
      <Checkbox.Button />
    </Checkbox>
  );
}
