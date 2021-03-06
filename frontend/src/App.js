import React, {Component} from 'react';
import PropTypes from 'prop-types';
import withStyles from "@material-ui/core/styles/withStyles";
import PrimaryAppBar from "./AppBar";
import Panel from "./Panel";
import './index.css'
import {
  CssBaseline,
  Container,
} from '@material-ui/core';
import moment from "moment";
import Copyright from "./Copyright";

export const FONT_FAMILY = 'Rubik';

class App extends Component {
  flag=0;

  state = {
    data: [],
    details: [],
    cluster: {},
    nextHour: [],
  };

  componentDidMount () {
    this.fetchData();
    setInterval(() => this.fetchData(), 30000);
  }

  fetchData () {
    this.fetchSummary();
  }

  fetchSummary () {
    fetch('https://harrynull.tech/cm/data/current', {
      method: "GET"
    }).then((response) => response.json())
      .then((responseData) => {
        this.setState({data: responseData.data});
        this.fetchClustering();
        for (let loc in this.state.data) {
          this.fetchNextHour(this.state.data[loc].id);
          this.fetchDetails(this.state.data[loc].id);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  fetchClustering () {
    fetch('https://harrynull.tech/cm/data/clustering', {
      method: "GET"
    }).then((response) => response.json())
      .then((responseData) => {
        this.setState({cluster: responseData.data});
      })
      .catch((error) => {
        console.error(error);
      });
  }

  fetchNextHour (id) {
    let form = new FormData();
    form.append("id", id);
    fetch('https://harrynull.tech/cm/data/predict', {
      method: 'post',
      body: form
    }).then((response) => response.json())
      .then((responseData) => {
        this.state.nextHour[id-1] = responseData.data;
        this.forceUpdate();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  fetchDetails (id) {
    let form = new FormData();
    form.append("id", id);
    form.append("from", (Math.round(moment()/1000)-86400).toString());
    form.append("to", Math.round(moment()/1000).toString());
    fetch('https://harrynull.tech/cm/data/time_range', {
      method: 'post',
      body: form
    }).then((response) => response.json())
      .then((responseData) => {
        this.state.details[id-1] = responseData.data;
        this.forceUpdate();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render () {
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        <CssBaseline/>
        <PrimaryAppBar/>
        <main className={classes.content}>
          <div className={classes.appBarSpacer}/>
          <Container maxWidth="md" className={classes.container}>
            <Panel locations={this.state.data}
                   details={this.state.details}
                   cluster={this.state.cluster}
                   nextHour={this.state.nextHour}
            />
          </Container>
          <Copyright/>
        </main>
      </div>
    );
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    overflow: 'hidden'
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflowY: 'scroll',
    paddingRight: '3px',
    [theme.breakpoints.between('xs', 'sm')]: {
      minWidth: "90%"
    }
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    [theme.breakpoints.between('xs', 'sm')]: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
    }
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
});

App.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
