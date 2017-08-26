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

  // function App() {
  //   return (
  //     <MuiThemeProvider>
  //       <RaisedButton label="Route A" />
  //       <RaisedButton label="Route B" />
  //     </MuiThemeProvider>
  //   )
  // }

  const Home = () => (
    <div>
      <h2>Home</h2>
    </div>
  )

  const About = () => (
    <div>
      <h2>About</h2>
    </div>
  )

  const Topic = ({ match }) => (
    <div>
      <h3>{match.params.topicId}</h3>
    </div>
  )

  const Topics = ({ match }) => (
    <div>
      <h2>Topics</h2>
      <ul>
        <li>
          <Link to={`${match.url}/rendering`}>
            Rendering with React
          </Link>
        </li>
        <li>
          <Link to={`${match.url}/components`}>
            Components
          </Link>
        </li>
        <li>
          <Link to={`${match.url}/props-v-state`}>
            Props v. State
          </Link>
        </li>
      </ul>

      <Route path={`${match.url}/:topicId`} component={Topic}/>
      <Route exact path={match.url} render={() => (
        <h3>Please select a topic.</h3>
      )}/>
    </div>
  )

  const BasicExample = () => (
    <Router>
      <div>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/topics">Topics</Link></li>
        </ul>

        <hr/>

        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
        <Route path="/topics" component={Topics}/>
      </div>
    </Router>
  )



  ReactDOM.render(
    <Router>
      <App />
    </Router>,
    document.getElementById('root')
  )

})
