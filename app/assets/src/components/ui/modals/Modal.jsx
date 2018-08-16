import { Modal as BaseModal } from "semantic-ui-react";
import React from "react";

const Modal = props => {
  return (
    <BaseModal {...props} className="idseq-ui-modal">
      <BaseModal.Header>{props.header}</BaseModal.Header>
      <BaseModal.Content>{props.content}</BaseModal.Content>
    </BaseModal>
  );
};

export default Modal;
