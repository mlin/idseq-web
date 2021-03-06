import { Button as BaseButton } from "semantic-ui-react";
import { forbidExtraProps } from "airbnb-prop-types";
import PropTypes from "prop-types";
import React from "react";

const Button = ({ icon, label, text, className, ...props }) => {
  let content = text;
  if (icon || label) {
    content = (
      <div className="icon-label">
        {icon}
        {text}
        {label}
      </div>
    );
  }
  let cname = "idseq-ui";
  if (className) {
    cname = `${cname} ${className}`;
  }
  return (
    <BaseButton {...props} className={cname}>
      {content}
    </BaseButton>
  );
};

Button.propTypes = forbidExtraProps({
  disabled: PropTypes.bool,
  icon: PropTypes.element,
  label: PropTypes.element,
  onClick: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseEnter: PropTypes.func,
  text: PropTypes.string,
  primary: PropTypes.bool,
  secondary: PropTypes.bool,
  className: PropTypes.string
});

export default Button;
