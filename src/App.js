import React, { Component } from 'react';
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import Navbar from 'react-bootstrap/lib/Navbar';
import Grid from './Grid';
import LoadData from './LoadData';
import QueryForm from './QueryForm';
import emitter from './emitter';

const initialState = {
  db: undefined,
  errorMsg: undefined,
  query: '',
  result: undefined,
  showModal: true,
  status: 'init', // init, parsing-data, creating-db, loaded, loading-error, running-query, query-error
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = initialState;
  }

  closeModal = () => {
    this.setState({
      showModal: false,
    });
  };

  handleNewClick = () => {
    this.setState({
      showModal: true,
    });
  };

  componentDidMount() {
    emitter.on('updateState', (state) => {
      this.setState(state);
    });

    emitter.on('runQuery', (query) => {
      this.setState({
        status: 'running-query',
      });

      try {
        const res = this.state.db.exec(query);

        const result = res.length === 0 ? {
          cols: [],
          rows: [],
        } : {
          cols: res[res.length - 1].columns,
          rows: res[res.length - 1].values,
        };

        this.setState({
          result,
          status: 'loaded',
        });
      } catch (err) {
        this.setState({
          errorMsg: err.message,
          status: 'query-error',
        });
      }
    });
  }

  render() {
    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand style={{color: '#000'}}>
              CSV SQL Live
            </Navbar.Brand>
          </Navbar.Header>
          <Navbar.Form pullRight>
            <Button style={{marginRight: "0.5em"}}>Loaded Table Info</Button>
            <Button bsStyle="danger" onClick={this.handleNewClick}>Add New CSV</Button>
          </Navbar.Form>
        </Navbar>

        <div className="container">       
          {['loaded', 'running-query', 'query-error'].includes(this.state.status) ? <QueryForm /> : null}
          {['loading-error', 'query-error'].includes(this.state.status) ? <p className="alert alert-danger"><b>Error!</b> {this.state.errorMsg}</p> : null}
          {this.state.result !== undefined ? <Grid cols={this.state.result.cols} rows={this.state.result.rows} /> : null}

          <div className="clearfix" />
          <hr />

          <footer>
            <p>Powered by <a href="http://papaparse.com/">Papa Parse</a>, <a href="https://github.com/kripken/sql.js/">sql.js</a>, and <a href="https://www.sqlite.org/">SQLite</a>.</p>
            <p><a href="https://github.com/dumbmatter/csv-sql-live">View on GitHub</a></p>
          </footer>
        </div>

        <Modal show={this.state.showModal} onHide={this.closeModal}>
          {this.state.status !== "init" ? <Modal.Header closeButton>
            <Modal.Title>Add New CSV</Modal.Title>
          </Modal.Header> : null}
          <Modal.Body>
            <LoadData />
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default App;
