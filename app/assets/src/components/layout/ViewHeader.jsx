import PropTypes from "prop-types";
import React from "react";

const ViewHeader = ({ title, subtitle, breadcrumbs, children }) => {
  const wrapComponent = (breacrumb, className) => {
    return <span className={className}>{breacrumb}</span>;
  };

  return (
    <div className="view-header">
      <div className="view-header-title-section">
        <div className="view-header-breadcrumbs">
          {breadcrumbs.map(breadcrumb => {
            return breacrumbComponent(
              breadcrumb,
              "view-header-breadcrumbs-crumb"
            );
          })}
        </div>
        <div className="view-header-title">{title}</div>
        <div className="view-header-subtitle">{subtitle}</div>
      </div>
      <div className="view-header-controls-section">
        {children.map(child => {
          return wrapComponent(child, "view-header-control");
        })}}
      </div>
    </div>
  );
};

ViewHeader.propTypes = {
  breadcrumbs: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ])
};

export default ViewHeader;
