import React from "react";
import clusterfck from "clusterfck";
import axios from "axios";
import d3 from "d3";
import queryString from "query-string";
import { Button, Icon, Popup } from "semantic-ui-react";
import copy from "copy-to-clipboard";
import { StickyContainer, Sticky } from "react-sticky";
import symlog from "./symlog";
import AdvancedThresholdFilterDropdown from "./modules/AdvancedThresholdFilter";
import ObjectHelper from "../helpers/ObjectHelper";
import ErrorBoundary from "./ErrorBoundary";
import Heatmap from "./visualizations/Heatmap";
import HeatmapLegend from "./visualizations/HeatmapLegend";
import ReactNouislider from "./ReactNouislider";
import LabeledDropdown from "./modules/LabeledDropdown";
import LabeledFilterDropdown from "./modules/LabeledFilterDropdown";
import TaxonTooltip from "./TaxonTooltip";

class SamplesHeatmap extends React.Component {
  constructor(props) {
    super(props);

    this.colors = [
      "rgb(255, 255, 255)",
      "rgb(243, 249, 243)",
      "rgb(232, 244, 232)",
      "rgb(221, 239, 220)",
      "rgb(210, 234, 209)",
      "rgb(199, 229, 197)",
      "rgb(188, 224, 186)",
      "rgb(177, 219, 175)",
      "rgb(166, 214, 164)",
      "rgb(155, 208, 152)",
      "rgb(144, 203, 141)",
      "rgb(133, 198, 129)",
      "rgb(122, 193, 118)",
      "rgb(111, 188, 106)",
      "rgb(100, 183, 95)",
      "rgb(89, 178, 84)",
      "rgb(78, 173, 73)"
    ];

    // URL params have precedence
    this.urlParams = this.parseUrlParams();

    this.state = {
      availableOptions: {
        // Server side options
        metrics: this.props.metrics,
        categories: this.props.categories,
        backgrounds: this.props.backgrounds,
        taxonLevels: this.props.taxonLevels.map(function(
          taxonLevelName,
          index
        ) {
          return { text: taxonLevelName, value: index };
        }),
        advancedFilters: this.props.advancedFilters,
        // Client side options
        scales: [["Log", symlog], ["Lin", d3.scale.linear]],
        taxonsPerSample: {
          min: 0,
          max: 100
        }
      },
      selectedOptions: {
        metric: this.urlParams.metric || this.props.metrics[0],
        categories: this.urlParams.categories || this.props.categories,
        background:
          this.urlParams.background || this.props.backgrounds[0].value,
        species: parseInt(this.urlParams.species) || 1,
        advancedFilters: this.urlParams.advancedFilters || [],
        dataScaleIdx: parseInt(this.urlParams.dataScaleIdx) || 0,
        taxonsPerSample: parseInt(this.urlParams.taxonsPerSample) || 30
      },
      data: null,
      taxons: {},
      loading: false,
      sampleIds: this.urlParams.sampleIds || this.props.sampleIds,
      taxonIds: this.urlParams.taxonIds || this.props.taxonIds || []
    };

    this.explicitApply = this.props.explicitApply || false;
    this.optionsChanged = false;

    // Note: copies references of nested objects
    this.appliedOptions = Object.assign({}, this.state.selectedOptions);

    this.dataGetters = {};
    this.dataAccessorKeys = {};
    for (var metric of this.state.availableOptions.metrics) {
      this.dataGetters[metric] = this.makeDataGetter(metric);
      this.dataAccessorKeys[metric] = metric.split(".");
    }

    this.getColumnLabel = this.getColumnLabel.bind(this);
    this.getRowLabel = this.getRowLabel.bind(this);
    this.getTaxonFor = this.getTaxonFor.bind(this);
    this.getTooltip = this.getTooltip.bind(this);
    this.onAdvancedFilterApply = this.onAdvancedFilterApply.bind(this);
    this.onAdvancedFilterChange = this.onAdvancedFilterChange.bind(this);
    this.onApplyClick = this.onApplyClick.bind(this);
    this.onBackgroundChanged = this.onBackgroundChanged.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.onCellClick = this.onCellClick.bind(this);
    this.onDataScaleChange = this.onDataScaleChange.bind(this);
    this.onMetricChange = this.onMetricChange.bind(this);
    this.onSampleLabelClick = this.onSampleLabelClick.bind(this);
    this.onShareClick = this.onShareClick.bind(this);
    this.onTaxonLevelChange = this.onTaxonLevelChange.bind(this);
    this.onTaxonsPerSampleChange = this.onTaxonsPerSampleChange.bind(this);
    this.onTaxonsPerSampleEnd = this.onTaxonsPerSampleEnd.bind(this);
  }

  componentDidMount() {
    this.fetchDataFromServer();
  }

  parseUrlParams() {
    let urlParams = queryString.parse(location.search);

    // consider the cases where variables can be passed as array string
    if (typeof urlParams.sampleIds === "string") {
      urlParams.sampleIds = urlParams.sampleIds.split(",");
    }
    if (typeof urlParams.taxonIds === "string") {
      urlParams.taxonIds = urlParams.taxonIds.split(",");
    }
    if (typeof urlParams.categories === "string") {
      urlParams.categories = urlParams.categories.split(",");
    }
    return urlParams;
  }

  downloadCurrentViewDataURL() {
    let params = this.getUrlParams();
    let url = new URL("/samples/download_heatmap", window.origin);
    let downloadableUrl = [
      url.toString(),
      "?",
      queryString.stringify(params, { arrayFormat: "bracket" })
    ].join("");
    return downloadableUrl;
  }

  getDataProperty(data, property) {
    let keys = this.dataAccessorKeys[property];
    return data[keys[0]][keys[1]];
  }

  makeDataGetter(metric) {
    return function(row, col) {
      let taxon = this.getTaxonFor(row, col);
      if (taxon) {
        return this.getDataProperty(taxon, metric);
      }
    }.bind(this);
  }

  metric2SortField(metric) {
    // TODO: change into a json object - requires server changes
    let fields = metric.split(".");
    let countType = fields[0].toLowerCase();
    let metricName = fields[1].toLowerCase();

    return "highest_" + countType + "_" + metricName;
  }

  fetchDataFromServer() {
    this.setState({ loading: true });

    axios
      .get("/samples/samples_taxons.json", {
        params: {
          sampleIds: this.state.sampleIds,
          taxonIds: this.state.taxonIds,
          species: this.state.selectedOptions.species,
          categories: this.state.selectedOptions.categories,
          sortBy: this.metric2SortField(this.state.selectedOptions.metric),
          advancedFilters: this.state.selectedOptions.advancedFilters,
          taxonsPerSample: this.state.selectedOptions.taxonsPerSample
        }
      })
      .then(response => {
        let taxons = this.extractTaxons(response.data);
        this.recluster = true;
        this.setState({
          data: response.data,
          taxons: taxons,
          loading: false
        });
      });
  }

  getMinMax(taxonNames) {
    let data = this.state.data;
    let metric = this.state.selectedOptions.metric;
    let taxonLists = [];
    taxonNames = new Set(taxonNames);
    for (let sample of data) {
      let sampleTaxons = [];
      for (let taxon of sample.taxons) {
        if (taxonNames.has(taxon.name)) {
          taxonLists.push(taxon);
        }
      }
      taxonLists.push(sampleTaxons);
    }
    let taxons = [].concat.apply([], taxonLists);
    let min = d3.min(taxons, taxon => {
      return this.getDataProperty(taxon, metric);
    });
    let max = d3.max(taxons, taxon => {
      return this.getDataProperty(taxon, metric);
    });
    let thresholdMin = d3.min(taxons, taxon => {
      return this.getDataProperty(taxon, metric);
    });

    let thresholdMax = d3.max(taxons, taxon => {
      return this.getDataProperty(taxon, metric);
    });

    return {
      min: min,
      max: max,
      thresholdMin: thresholdMin,
      thresholdMax: thresholdMax
    };
  }

  clusterSamples(data, metric, taxons) {
    let vectors = [];
    for (let sample of data) {
      let vector = [];
      for (let taxonName of taxons) {
        let value = null;
        for (let taxon of sample.taxons) {
          if (taxon.name == taxonName) {
            value = this.getDataProperty(taxon, metric);
            break;
          }
        }
        vector.push(value);
      }
      vector.sample = sample;
      vectors.push(vector);
    }

    let cluster = clusterfck.hcluster(vectors);

    let clusteredSamples = [];
    let toVisit = [cluster];
    while (toVisit.length > 0) {
      let node = toVisit.pop();
      if (node.right) {
        toVisit.push(node.right);
      }
      if (node.left) {
        toVisit.push(node.left);
      }

      if (node.value) {
        node.label = node.value.sample.name;
        clusteredSamples.push(node.value.sample);
      }
    }

    return {
      tree: cluster,
      flat: clusteredSamples.reverse()
    };
  }

  extractTaxons(data) {
    let idToName = {},
      idToCategory = {},
      nameToId = {},
      ids = new Set(),
      categories = new Set();

    for (var i = 0, len = data.length; i < len; i += 1) {
      let sample = data[i];
      for (var j = 0; j < sample.taxons.length; j += 1) {
        let taxon = sample.taxons[j];
        idToName[taxon.tax_id] = taxon.name;
        idToCategory[taxon.tax_id] = taxon.category_name;
        nameToId[taxon.name] = taxon.tax_id;
        ids.add(taxon.tax_id);
        categories.add(taxon.category_name);
      }
    }

    return {
      idToName: idToName,
      idToCategory: idToCategory,
      nameToId: nameToId,
      ids: Array.from(ids),
      names: Object.keys(nameToId),
      categories: Array.from(categories).sort()
    };
  }

  clusterTaxons(data, dataType, taxonNames) {
    let taxonScores = {};
    for (let taxon of taxonNames) {
      taxonScores[taxon] = [];

      for (let sample of data) {
        let value = null;
        for (let sampleTaxon of sample.taxons) {
          if (sampleTaxon.name == taxon) {
            value = this.getDataProperty(sampleTaxon, dataType);
            break;
          }
        }
        taxonScores[taxon].push(value);
      }
    }

    let vectors = [];
    for (let key of Object.keys(taxonScores)) {
      let vector = taxonScores[key];
      vector.taxonName = key;
      vectors.push(vector);
    }
    let cluster = clusterfck.hcluster(vectors);
    if (!cluster) {
      return {};
    }
    let clusteredTaxons = [];
    let toVisit = [cluster];
    while (toVisit.length > 0) {
      let node = toVisit.pop();
      if (node.right) {
        toVisit.push(node.right);
      }
      if (node.left) {
        toVisit.push(node.left);
      }

      if (node.value) {
        node.label = node.value.taxonName;
        clusteredTaxons.push(node.value.taxonName);
      }
    }

    return {
      tree: cluster,
      flat: clusteredTaxons
    };
  }

  getColumnLabel(columnIndex) {
    return this.clusteredSamples.flat[columnIndex].name;
  }

  getRowLabel(rowIndex) {
    return this.clusteredTaxons.flat[rowIndex];
  }

  getTaxonFor(rowIndex, columnIndex) {
    let d = this.clusteredSamples.flat[columnIndex];
    let taxonName = this.clusteredTaxons.flat[rowIndex];

    for (let i = 0; i < d.taxons.length; i += 1) {
      let taxon = d.taxons[i];
      if (taxon.name == taxonName) {
        return taxon;
      }
    }
    return undefined;
  }

  getTooltip(rowIndex, columnIndex) {
    let sample = this.clusteredSamples.flat[columnIndex],
      taxonName = this.clusteredTaxons.flat[rowIndex],
      taxon;

    for (let i = 0; i < sample.taxons.length; i += 1) {
      let ttaxon = sample.taxons[i];
      if (ttaxon.name == taxonName) {
        taxon = ttaxon;
        break;
      }
    }

    return <TaxonTooltip sample={sample} taxon={taxon} />;
  }

  renderLoading() {
    return (
      <p className="loading-indicator text-center">
        <i className="fa fa-spinner fa-pulse fa-fw" /> Loading...
      </p>
    );
  }

  onSampleLabelClick(d, i) {
    let sample = this.clusteredSamples.flat[i];
    window.location.href = "/samples/" + sample.sample_id;
  }

  onCellClick(d) {
    let sample = this.clusteredSamples.flat[d.col];
    window.location.href = "/samples/" + sample.sample_id;
  }

  onRemoveRow(rowLabel) {
    let taxons = this.state.taxons;
    let id = taxons.nameToId[rowLabel];

    let idx = taxons.names.indexOf(rowLabel);
    taxons.names.splice(idx, 1);

    idx = taxons.ids.indexOf(id);
    taxons.ids.splice(idx, 1);

    delete taxons.nameToId[rowLabel];
    delete taxons.idToName[id];
    this.recluster = true;
    this.setState({
      taxons: taxons
    });
  }

  renderHeatmap() {
    if (this.state.loading || !this.state.data || !this.state.data.length) {
      return;
    }
    let scaleIndex = this.state.selectedOptions.dataScaleIdx;
    return (
      <ErrorBoundary>
        <Heatmap
          colTree={this.clusteredSamples.tree}
          rowTree={this.clusteredTaxons.tree}
          rows={this.state.taxons.names.length}
          columns={this.state.data.length}
          getRowLabel={this.getRowLabel}
          getColumnLabel={this.getColumnLabel}
          getCellValue={this.dataGetters[this.state.selectedOptions.metric]}
          getTooltip={this.getTooltip}
          onCellClick={this.onCellClick}
          onColumnLabelClick={this.onSampleLabelClick}
          onRemoveRow={this.onRemoveRow}
          scale={this.state.availableOptions.scales[scaleIndex][1]}
          colors={this.colors}
        />
      </ErrorBoundary>
    );
  }

  onMetricChange(_, newMetric) {
    // this.recluster = true;
    this.setState({
      selectedOptions: Object.assign({}, this.state.selectedOptions, {
        metric: newMetric.value
      })
    });
    this.optionsChanged = true;
    if (!this.explicitApply) {
      this.updateHeatmap();
    }
  }

  renderMetricPicker() {
    let options = this.state.availableOptions.metrics.map(function(metric) {
      return { text: metric, value: metric };
    });

    return (
      <LabeledDropdown
        fluid
        options={options}
        onChange={this.onMetricChange}
        value={this.state.selectedOptions.metric}
        label="Metric:"
        disabled={!this.state.data}
      />
    );
  }

  onAdvancedFilterChange() {
    this.optionsChanged = true;
  }

  onAdvancedFilterApply(filters) {
    this.setState({
      selectedOptions: Object.assign({}, this.state.selectedOptions, {
        advancedFilters: filters
      })
    });
    this.optionsChanged = true;
    if (!this.explicitApply) {
      this.updateHeatmap();
    }
  }

  renderAdvancedFilterPicker() {
    return (
      <AdvancedThresholdFilterDropdown
        fluid
        labels={this.state.availableOptions.advancedFilters.filters}
        operators={[">=", "<="]}
        filters={this.state.selectedOptions.advancedFilters}
        onChange={this.onAdvancedFilterChange}
        onApply={this.onAdvancedFilterApply}
        applyOnHide={true}
        disabled={!this.state.data}
      />
    );
  }

  onTaxonLevelChange(e, d) {
    if (this.state.selectedOptions.species == d.value) {
      return;
    }

    this.setState({
      selectedOptions: Object.assign({}, this.state.selectedOptions, {
        species: d.value
      })
    });
    this.optionsChanged = true;
    if (!this.explicitApply) {
      this.updateHeatmap();
    }
  }

  renderTaxonLevelPicker() {
    return (
      <LabeledDropdown
        fluid
        options={this.state.availableOptions.taxonLevels}
        value={this.state.selectedOptions.species}
        onChange={this.onTaxonLevelChange}
        label="Taxon Level:"
        disabled={!this.state.data}
      />
    );
  }

  onDataScaleChange(_, d) {
    this.recluster = true;
    this.setState({
      selectedOptions: Object.assign({}, this.state.selectedOptions, {
        dataScaleIdx: d.value
      })
    });
  }

  renderScalePicker() {
    let options = this.state.availableOptions.scales.map(function(
      scale,
      index
    ) {
      return { text: scale[0], value: index };
    });

    return (
      <LabeledDropdown
        fluid
        value={this.state.selectedOptions.dataScaleIdx}
        onChange={this.onDataScaleChange}
        options={options}
        label="Scale:"
        disabled={!this.state.data}
      />
    );
  }

  renderLegend() {
    return (
      <HeatmapLegend
        colors={this.colors}
        min={this.minMax ? this.minMax.thresholdMin : 0}
        max={this.minMax ? this.minMax.thresholdMax : 1}
        disabled={!this.state.data || !this.minMax}
      />
    );
  }

  onApplyClick() {
    this.updateHeatmap();
  }

  updateHeatmap() {
    this.fetchDataFromServer();
    this.optionsChanged = false;
  }

  getUrlParams() {
    return Object.assign(
      {
        sampleIds: this.state.sampleIds,
        taxonIds: this.state.taxonIds
      },
      this.state.selectedOptions
    );
  }

  onShareClick() {
    let params = this.getUrlParams();
    let url = new URL(location.pathname, window.origin);
    let shareableUrl = [
      url.toString(),
      "?",
      queryString.stringify(params, { arrayFormat: "bracket" })
    ].join("");
    copy(shareableUrl);
  }

  onCategoryChange(e, value) {
    let newValue = value.length ? value : this.state.selectedOptions.categories;
    // this.recluster = true;
    this.setState({
      selectedOptions: Object.assign({}, this.state.selectedOptions, {
        categories: newValue
      })
    });
    this.optionsChanged = true;
    if (!this.explicitApply) {
      this.updateHeatmap();
    }
  }

  renderCategoryFilter() {
    let options = this.state.availableOptions.categories.map(function(
      category
    ) {
      return { text: category, value: category };
    });

    return (
      <LabeledFilterDropdown
        fluid
        options={options}
        onChange={this.onCategoryChange}
        value={this.state.selectedOptions.categories}
        label="Taxon Categories:"
        disabled={!this.state.data}
      />
    );
  }

  onBackgroundChanged(_, newBackground) {
    this.setState({
      selectedOptions: Object.assign({}, this.state.selectedOptions, {
        background: newBackground.value
      })
    });
    this.optionsChanged = true;
    if (!this.explicitApply) {
      this.updateHeatmap();
    }
  }

  renderBackgroundPicker() {
    let options = this.state.availableOptions.backgrounds.map(function(
      background
    ) {
      return { text: background.name, value: background.value };
    });

    return (
      <LabeledDropdown
        fluid
        options={options}
        onChange={this.onBackgroundChanged}
        value={this.state.selectedOptions.background}
        label="Background:"
        disabled={!this.state.data}
      />
    );
  }

  onTaxonsPerSampleChange(values, handle) {
    let value = parseInt(values[handle]);
    if (value != this.state.selectedOptions.taxonsPerSample) {
      this.setState({
        selectedOptions: Object.assign({}, this.state.selectedOptions, {
          taxonsPerSample: parseInt(values[handle])
        })
      });
      this.optionsChanged = true;
    }
  }

  onTaxonsPerSampleEnd() {
    if (!this.explicitApply) {
      this.updateHeatmap();
    }
  }

  renderTaxonsPerSampleSlider() {
    let range = {
      min: [this.state.availableOptions.taxonsPerSample.min],
      max: [this.state.availableOptions.taxonsPerSample.max]
    };
    return (
      <div>
        <ReactNouislider
          range={range}
          start={[this.state.selectedOptions.taxonsPerSample]}
          onUpdate={this.onTaxonsPerSampleChange}
          onEnd={this.onTaxonsPerSampleEnd}
          disabled={!this.state.data}
        />
        <span>
          Taxons per Sample: {this.state.selectedOptions.taxonsPerSample}
        </span>
      </div>
    );
  }

  renderSubMenu(sticky) {
    return (
      <div style={sticky.style}>
        <div className="row sub-menu">
          <div className="col s3">{this.renderTaxonLevelPicker()}</div>
          <div className="col s3">{this.renderCategoryFilter()}</div>
          <div className="col s3">{this.renderMetricPicker()}</div>
          <div className="col s3">{this.renderBackgroundPicker()}</div>
        </div>
        <div className="row sub-menu">
          <div className="col s3">{this.renderAdvancedFilterPicker()}</div>
          <div className="col s3">{this.renderTaxonsPerSampleSlider()}</div>
          <div className="col s3">{this.renderScalePicker()}</div>
          <div className="col s3">{this.renderLegend()}</div>
        </div>
      </div>
    );
  }

  filterTaxons() {
    let filteredNames = [],
      categories = new Set(this.state.selectedOptions.categories);

    for (let name of this.state.taxons.names) {
      let id = this.state.taxons.nameToId[name];
      let category = this.state.taxons.idToCategory[id];
      if (categories.has(category)) {
        let has_value = false;
        for (let sample of this.state.data) {
          for (let taxon of sample.taxons) {
            if (taxon.tax_id == id) {
              has_value = true;
              break;
            }
          }
          if (has_value) {
            break;
          }
        }
        if (has_value) {
          filteredNames.push(name);
        }
      }
    }
    return filteredNames;
  }

  renderVisualization() {
    return (
      <StickyContainer>
        <Sticky>{this.renderSubMenu.bind(this)}</Sticky>
        <div className="row visualization-content">
          {this.state.loading && this.renderLoading()}
          {this.renderHeatmap()}
        </div>
      </StickyContainer>
    );
  }

  clusterData() {
    if (this.state.data && this.state.data.length) {
      this.clusteredSamples = this.clusterSamples(
        this.state.data,
        this.state.selectedOptions.metric,
        this.state.taxons.names
      );
      this.clusteredTaxons = this.clusterTaxons(
        this.state.data,
        this.state.selectedOptions.metric,
        this.state.taxons.names
      );
      this.minMax = this.getMinMax(this.state.taxons.names);
    }
  }

  render() {
    if (this.recluster) {
      this.clusterData();
      this.recluster = false;
    }

    return (
      <div id="project-visualization">
        <div className="heatmap-header">
          <Popup
            trigger={
              <Button className="right" primary onClick={this.onShareClick}>
                Share
              </Button>
            }
            content="A shareable URL has been copied to your clipboard!"
            on="click"
            hideOnScroll
          />
          <Button
            className="right"
            secondary
            href={this.downloadCurrentViewDataURL()}
            disabled={!this.state.data}
          >
            <Icon className="cloud download alternate" />
            Download
          </Button>
          {this.explicitApply && (
            <Button
              className="right"
              primary
              onClick={this.onApplyClick.bind(this)}
              disabled={!this.optionsChanged}
            >
              Apply
            </Button>
          )}
          <h2>
            Comparing {this.state.data ? this.state.data.length : ""} samples
          </h2>
        </div>
        {this.renderVisualization()}
      </div>
    );
  }
}

export default SamplesHeatmap;
