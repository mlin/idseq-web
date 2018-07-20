import React from "react";
import PropTypes from "prop-types";
import { Dropdown } from "semantic-ui-react";

class LabeledDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.passedOnChange = this.props.onChange;
  }

  onChange(e, d) {
    this.passedOnChange && this.passedOnChange(e, d);
  }

  renderText() {
    let label;
    for (let opt of this.props.options) {
      if (opt.value == this.props.value) {
        label = opt.text;
        break;
      }
    }
    return (
      <span className="title">
        <b>{this.props.label}</b> {label}
      </span>
    );
  }
  render() {
    return (
      <Dropdown
        {...this.props}
        onChange={this.onChange.bind(this)}
        trigger={this.renderText()}
      />
    );
  }
}

LabeledDropdown.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.array,
  value: PropTypes.string
};

export default LabeledDropdown;
