import { Modal as BaseModal } from "semantic-ui-react";
import PropTypes from "prop-types";
import React from "react";

const PhyloTreeListModal = ({ trigger, header, content }) => (
  <BaseModal trigger={trigger}>
    <BaseModal.Header>{header}</BaseModal.Header>
    <BaseModal.Content>{content}</BaseModal.Content>
  </BaseModal>
);

PhyloTreeListModal.propTypes = {
  trigger: PropTypes.element,
  header: PropTypes.string,
  content: PropTypes.element
};

export default PhyloTreeListModal;
