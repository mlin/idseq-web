import { Tab as BaseTab } from "semantic-ui-react";
import React from "react";

export const Tab = props => {
  return <BaseTab {...props} className="idseq-ui tab" />;
};

export const TabPane = props => {
  return <BaseTab.Pane {...props} className="idseq-ui-tab-pane" />;
};

export default Tab;
