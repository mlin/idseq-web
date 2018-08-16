import Modal from "./Modal";
import PropTypes from "prop-types";
import React from "react";

const PhyloTreeListModal = ({ trigger, header, content }) => {
  return <Modal trigger={trigger} header={header} content={content} />;
};

PhyloTreeListModal.propTypes = {
  trigger: PropTypes.element,
  header: PropTypes.string,
  content: PropTypes.element
};

export default PhyloTreeListModal;
