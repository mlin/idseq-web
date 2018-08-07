import PropTypes from "prop-types";
import React from "react";
import { Dropdown as BaseDropdown, Label } from "semantic-ui-react";

class MultipleBySectionDropdown extends React.Component {
  constructor(props) {
    super(props);

    this.onChange = this.props.onChange;

    this.state = {
      value: this.props.value || []
    };
  }

  optionClicked(e, d) {
    e.stopPropagation();
    let value = this.state.value.slice();
    let idx = value.indexOf(d["data-value"]);
    if (idx > -1) {
      value.splice(idx, 1);
    } else {
      value.push(d["data-value"]);
    }
    this.onChange && this.onChange(e, value);
    this.setState({ value });
  }

  renderMenuItems(options) {
    let ret = [];
    for (let option of options) {
      ret.push(
        <BaseDropdown.Item
          key={option.value}
          data-value={option.value}
          onClick={this.optionClicked.bind(this)}
        >
          <span className="text">
            <input
              type="checkbox"
              checked={this.state.value.indexOf(option.value) > -1}
              readOnly
            />
            {option.text}
          </span>
        </BaseDropdown.Item>
      );
    }
    return ret;
  }

  renderLabel() {
    return (
      <div className="label-container">
        <div className="label-container-title">{this.props.label}</div>
        {this.state.value.length > 0 && (
          <Label className="label-container-count">
            {this.state.value.length}
          </Label>
        )}
      </div>
    );
  }

  render() {
    return (
      <BaseDropdown
        floating
        labeled
        className="idseq-ui multiple-by-section"
        {...this.props}
        options={undefined}
        value={undefined}
        trigger={this.renderLabel()}
      >
        <BaseDropdown.Menu>
          <div className="section-menu">
            <BaseDropdown.Header content="Filter by tag" />
            <BaseDropdown.Item data-value={1} text="Important" />
            <BaseDropdown.Item data-value={2} text="Announcement" />
            <BaseDropdown.Item data-value={3} text="Discussion" />
          </div>
          <div className="section-menu">
            <BaseDropdown.Header content="Filter by Color" />
            <BaseDropdown.Item data-value={4} text="Red" />
            <BaseDropdown.Item data-value={5} text="Blue" />
            <BaseDropdown.Item data-value={6} text="Black" />
          </div>
          {/* {[Object.entries(this.props.options)[0]].map(optionsBySection => {
              <BaseDropdown.Header content={<div>{optionsBySection[0]}</div>} />
              {this.renderMenuItems(optionsBySection[1])}
          })} */}
        </BaseDropdown.Menu>
      </BaseDropdown>
    );
  }
}

MultipleBySectionDropdown.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.object,
  value: PropTypes.array
};

export default MultipleBySectionDropdown;
