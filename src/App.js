import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

//komponen
import Registration from './pages/registration';
import Login from './pages/login';
import ForgotPassword from './pages/forgot-password';
import NotFound from './pages/404';
import Private from './pages/private';
import PrivateRoute from './components/PrivateRoute';

// firebase context provider
import FirebaseProvider from './components/FIrebaseProvider';
function App() {
  return (
		<FirebaseProvider>
			<Router>
				<Switch>
					<PrivateRoute path="/" exact component={Private}/>
					<PrivateRoute path="/settings" component={Private}/>
					<PrivateRoute path="/transaction" component={Private}/>
					<PrivateRoute path="/product" component={Private}/>
					<Route path="/registration" component={Registration}/>
					<Route path="/login" component={Login}/>
					<Route path="/forgot-password" component={ForgotPassword}/>
					<Route component={NotFound}/>
				</Switch>
			</Router>
		</FirebaseProvider>

  );
}

export default App;
