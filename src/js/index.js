import React from 'react'
import ReactDOM from 'react-dom'
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'
import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import RaisedButton from 'material-ui/RaisedButton';
import App from './react-app.js'
import Auth from './auth.js'
var print = console.log.bind(console)


injectTapEventPlugin();
var googleScriptSrc = '//apis.google.com/js/platform.js'
var facebookScriptSrc = '//connect.facebook.net/en_US/sdk.js'

var gg = new Auth({provider: 'google', scriptSrc:googleScriptSrc, cred:{
    'clientId': '32902065428-sbal87ccp0eedjoo2opcq0tr22ha3884.apps.googleusercontent.com',
    'scope': 'profile email'
  }})

var fb = new Auth({provider: 'facebook', scriptSrc:facebookScriptSrc, cred:{
    'appId': '126309204593715',
    'cookie': true,
    'xfbml': true,
    'version': 'v2.9',
    'scope': 'email'
  }})


window.gg = gg
window.fb = fb


window.addEventListener('load', ev => {

  ReactDOM.render(
    <Router>
      <App />
    </Router>,
    document.getElementById('root')
  )

})
