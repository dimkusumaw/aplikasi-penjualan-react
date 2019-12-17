import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';

//komponen
import UserSetting from './usersetting';
import StoreSetting from './storesetting';

function Settings(){

  return(
    <Switch>
      <Route path="/settings/usersetting" component={UserSetting}/>
      <Route path="/settings/storesetting" component={StoreSetting}/>
      <Redirect to="/settings/usersetting"/>
    </Switch>
  )
}

export default Settings;