import PropTypes from "prop-types";
import React from "react";
import Wizard from "../../ui/containers/Wizard";
import axios from "axios";

class PhyloTreeByPathCreation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      skipListTrees: false,
      phyloTreesLoaded: false
    };
  }

  componentDidMount() {
    this.loadPhylotrees();
  }

  loadPhylotrees() {
    axios
      .get("/phylo_trees/index.json", {
        params: {
          taxId: this.props.taxId,
          projectId: this.props.projectId
        }
      })
      .then(response => {
        console.log("load phylo trees", response.data);
        let phyloTrees = response.data.phyloTrees;
        if (
          !phyloTrees ||
          typeof phyloTrees !== "array" ||
          phyloTrees.length === 0
        ) {
          console.log("skipping");
          this.setState({
            skipListTrees: true,
            phyloTreesLoaded: true
          });
        } else {
          console.log("load the data");
          this.setState({
            phyloTreesLoaded: true
          });
        }
      })
      .catch(error => {
        console.log("error phylo trees", error);
      });
  }

  getPages() {
    let pages = [];
    if (!this.state.skipListTrees) {
      pages.push(
        <Wizard.Page key={0} title="List Trees">
          <div>Intro</div>
          <div>Not counting</div>
        </Wizard.Page>
      );
    }
    pages.push(
      <Wizard.Page key={1} title="Testing Page 1">
        <div>Page 1</div>
        <div>Contents</div>
      </Wizard.Page>,
      <Wizard.Page key={2} title="Testing Page 2">
        <div>Page 2</div>
        <div>Contents</div>
      </Wizard.Page>
    );
    return pages;
  }

  render() {
    if (this.state.phyloTreesLoaded) {
      console.log("phylo trees loaded", this.state);
      return (
        <Wizard
          skipPageInfoNPages={this.state.skipListTrees ? 0 : 1}
          onComplete={this.props.onComplete}
        >
          {this.getPages()}
        </Wizard>
      );
    } else {
      console.log("phylo trees not loaded");
      return <div>Loading Phylo Trees...</div>;
    }
  }
}

export default PhyloTreeByPathCreation;
