class PipelineSampleReport extends React.Component {

  constructor(props) {
    super(props);
    this.report_details = props.report_details;
    this.taxonomy_details = props.taxonomy_details;
    this.view_level = props.view_level;
    this.highest_tax_counts = props.highest_tax_counts;
    const current_sort = PipelineSampleReport.currentSort();
    this.state = {
      sort_title: current_sort.sort_title
        ? current_sort.sort_title :'Highest zscore',
      sort_query: current_sort.sort_query
        ? current_sort.sort_query  : 'sort_by=highest_zscore'
    };
    this.applySort = this.applySort.bind(this);

  }

  uppCaseFirst(name) {

    return (name)? name.charAt(0).toUpperCase() + name.slice(1) : name;
  }

  static currentSort() {
   const sort_by = ReportFilter.getFilter('sort_by');
   let current_sort = {};
   if(sort_by) {
     current_sort = {
       sort_title: `${sort_by.replace('_', ' ')}`,
       sort_query: `sort_by=${sort_by}`
     }
   }
   return current_sort;
  }

  applySort(e) {
    const sort_title = (e.target.textContent)
      ? e.target.textContent : this.state.sort_title;
    let sort_query = '';
    switch (sort_title.toLowerCase()) {
      case 'lowest zscore':
        sort_query = 'sort_by=lowest_zscore';
        break;
      case 'highest zscore':
        sort_query = 'sort_by=highest_zscore';
        break;
      case 'lowest rpm':
        sort_query = 'sort_by=lowest_rpm';
        break;
      case 'highest rpm':
        sort_query = 'sort_by=highest_rpm';
        break;
      default:
        sort_query = this.state.sort_query;
    }
    this.setState({sort_title, sort_query });
    const url = PipelineSampleReport.deleteUrlParam(window.location.href, 'sort_by');
    window.location = (PipelineSampleReport.hasQuery(url))
      ? `${url}&${sort_query}` : `${url}?${sort_query}`;
  }

  static deleteUrlParam(url, parameter) {
    const queryString = url.split('?');
    if (queryString.length >= 2) {
      const prefix = encodeURIComponent(parameter)+'=';
      const pars = queryString[1].split(/[&;]/g);
      for (let i = pars.length; i--; i > 0) {
        //idiom for string.startsWith
        if (pars[i].lastIndexOf(prefix, 0) !== -1) {
          pars.splice(i, 1);
        }
      }
      url = queryString[0] + (pars.length > 0 ? '?' + pars.join('&') : '');
      return url;
    } else {
      return url;
    }
  }

  static hasQuery(url) {
    return (url.split('?').length >= 2);
  }

  componentDidMount() {
    $('ul.tabs').tabs();
    $('.sort-report').dropdown();
  }

  render() {
    return (
      <div>
        <div id="reports" className="reports-screen tab-screen col s12">
          <div className="container tab-screen-content">
            <div className="row">
              <div className="col s3">
                <ReportFilter
                  background_model = {this.report_details.background_model.name}
                  report_title = { this.report_details.report_info.name }
                  view_level={this.uppCaseFirst(this.view_level)}
                  highest_tax_counts={this.highest_tax_counts}/>
              </div>
              <div className="col s9 reports-main ">
                <div className="report-sort right">

                  <span className="">
                    <a className='dropdown-button btn btn-flat grey lighten-4 sort-report' href='#' data-activates='sort-report'>
                      <span className="sort-by">Sort By:</span>
                      <span className="sort-value">{ this.state.sort_title }</span>
                      <i className="fa fa-sort"></i>
                    </a>
                  </span>

                  <ul id='sort-report' className='dropdown-content'>
                    <li>
                      <a onClick={this.applySort}>
                        <div  className="sort-title">Lowest zscore</div>
                        <div className="fa fa-sort-amount-asc right sort-icon"></div>
                      </a>
                    </li>
                    <li>
                      <a onClick={this.applySort}>
                        <div className="sort-title">Highest zscore</div>
                        <div className="fa fa-sort-amount-desc right sort-icon"></div>
                      </a>
                    </li>
                    <li>
                      <a onClick={this.applySort}>
                        <div className="sort-title">Lowest rpm</div>
                        <div className="fa fa-sort-amount-asc right sort-icon"></div>
                      </a>
                    </li>
                    <li>
                      <a onClick={this.applySort}>
                        <div className="sort-title">Highest rpm</div>
                        <div className="fa fa-sort-amount-desc right sort-icon"></div>
                      </a>
                    </li>
                  </ul>
                </div>
                <table className='bordered report-table'>
                  <thead>
                  <tr>
                    <th>{this.uppCaseFirst(this.view_level)}</th>
                    <th>NT {this.uppCaseFirst(this.view_level)} Z</th>
                    <th>NT {this.uppCaseFirst(this.view_level)} rM</th>
                    <th>NR {this.uppCaseFirst(this.view_level)} Z</th>
                    <th>NR {this.uppCaseFirst(this.view_level)} rM</th>
                  </tr>
                  </thead>
                  <tbody>
                  { this.taxonomy_details.map((genus_detail, i) => {
                    return (
                      <tr key={i}>
                        <td>
                          <span className="link">
                            <a href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=${
                              genus_detail.nt_ele.tax_id}`}>{ genus_detail.nt_ele.name }
                          </a>
                          </span>
                        </td>
                        <td>{ (!genus_detail.nt_ele.zscore) ? '': genus_detail.nt_ele.zscore }</td>
                        <td>{ genus_detail.nt_ele.rpm }</td>
                        <td>
                          { (!genus_detail.nr_ele) ? '': genus_detail.nr_ele.zscore }
                          </td>
                        <td>
                          { (!genus_detail.nr_ele) ? '': genus_detail.nr_ele.rpm }
                          </td>
                      </tr>
                    )
                  })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}