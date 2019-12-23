import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';


// material-ui
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
//komponen
import UserSetting from './usersetting';
import StoreSetting from './storesetting';

//styles
import useStyles from './styles';
// import classes from '*.module.css';
function Settings(props){

  const {location, history} = props;
  const classes = useStyles();
  const handleChangeTab = (event, value) => {
    history.push(value);
  }

  return(
    <Paper square>
      <Tabs value={location.pathname} indicatorColor="primary" textColor="primary" onChange={handleChangeTab}>
        <Tab label="User" value="/settings/usersetting"/>
        <Tab label="Store" value="/settings/storesetting"/>
      </Tabs>
      <div className={classes.tabContent}>
        <Switch>
          <Route path="/settings/usersetting" component={UserSetting}/>
          <Route path="/settings/storesetting" component={StoreSetting}/>
          <Redirect to="/settings/usersetting"/>
        </Switch>
      </div>
    </Paper>

  )
}

export default Settings;