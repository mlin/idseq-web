import PropTypes from "prop-types";
import React from "react";

class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node
};

export default ErrorBoundary;
