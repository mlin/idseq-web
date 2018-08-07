import React from "react";
import { Dropdown as BaseDropdown } from "semantic-ui-react";
import PropTypes from "prop-types";

class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.props.onChange;
    this.state = { value: this.props.value || this.props.options[0].value };
    this.labels = this.props.options.reduce((labelMap, option) => {
      labelMap[option.value.toString()] = option.text;
      return labelMap;
    }, {});
  }

  onChange(e, d) {
    this.setState({ value: d.value });
    this.onChange(e, d);
  }

  renderText() {
    return (
      <div>
        <span className="label-title">{this.props.label}</span>
        {this.state.value ? this.labels[this.state.value.toString()] : ""}
      </div>
    );
  }

  render() {
    return (
      <BaseDropdown
        disabled={this.props.disabled}
        fluid={this.props.fluid}
        options={this.props.options}
        value={this.state.value}
        floating
        className="idseq-ui"
        onChange={this.onChange.bind(this)}
        trigger={this.renderText()}
      />
    );
  }
}

Dropdown.propTypes = {
  disabled: PropTypes.bool,
  fluid: PropTypes.bool,
  label: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default Dropdown;
