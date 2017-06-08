// import Kitchen from './kitchen'
import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {lightTheme, darkTheme} from './react-themes'
import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import DropDownMenu from 'material-ui/DropDownMenu'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Popover from 'material-ui/Popover'
import Toggle from 'material-ui/Toggle'
import {GridList, GridTile} from 'material-ui/GridList'
import IconButton from 'material-ui/IconButton'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'
import Subheader from 'material-ui/Subheader'
import FontIcon from 'material-ui/FontIcon'
import CircularProgress from 'material-ui/CircularProgress'
import Snackbar from 'material-ui/Snackbar'
import Avatar from 'material-ui/Avatar'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right'
import Drawer from 'material-ui/Drawer'
import {List, ListItem} from 'material-ui/List'
import Divider from 'material-ui/Divider'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import ContentAdd from 'material-ui/svg-icons/content/add'
import ContentAddBox from 'material-ui/svg-icons/content/add-box'
import AvLibraryAdd from 'material-ui/svg-icons/av/library-add'
import Auth from './auth'
import AppHeader from './react-app-header'
import AppNav from './react-app-nav'
import {
  Switch,
  Route,
  Link,
  Redirect,
  withRouter
} from 'react-router-dom'
import Items from './react-app-items'


const googleScriptSrc = '//apis.google.com/js/platform.js'
const facebookScriptSrc = '//connect.facebook.net/en_US/sdk.js'
const authProviders = {}

authProviders['google'] = new Auth({provider: 'google', scriptSrc:googleScriptSrc, cred:{
  'clientId': '',
  'scope': 'profile email'
}})

authProviders['facebook'] = new Auth({provider: 'facebook', scriptSrc:facebookScriptSrc, cred:{
  'appId': '',
  'cookie': true,
  'xfbml': true,
  'version': 'v2.9',
  'scope': 'email'
}})


window.authProviders = authProviders

const Theme = (props) => (
  <MuiThemeProvider muiTheme={getMuiTheme(props.theme)}>
    {props.children}
  </MuiThemeProvider>
)

const vlayout = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'stretch',
}

const hlayout = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'stretch',
}

const layoutStack = {
  position: 'relative',
  display: 'flex',
  // width: '100%',
  flexFlow: 'column nowrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'stretch',
}

function merge(...objs) {
  return Object.assign({}, ...objs)
}

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const Item = ({ match }) => (
  <div>
    <h2>Item</h2>
    <h3>{match.params.topicId}</h3>
  </div>
)

const Category = ({ match }) => (
  <div>
    <h2>Category</h2>
    <h3>{match.params.topicId}</h3>
  </div>
)

const EditItem = ({ match }) => (
  <div>
    <h2>Edit Item</h2>
    <h3>{match.params.topicId}</h3>
  </div>
)

const EditCategory = ({ match }) => (
  <div>
    <h2>Edit Category</h2>
    <h3>{match.params.topicId}</h3>
  </div>
)

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      message: {
        isOpen: false,
        content: '',
      },
      nav: {
        isOpen: false,
      },
      fab: {
        isOpen: false,
        anchor: null,
      }
    }
  }

  sub = (subject, subscriber) => {
    if(!this._subs)
      this._subs = {}

    var subs = this._subs[subject] || []
    subs.push(subscriber)
    this._subs[subject] = subs
  }

  pub = (subject, data) => {
    if(!this._subs)
      return

    var subs = this._subs[subject] || []
    for(let sub of subs) {
      sub(data)
    }
  }

  componentDidMount = () => {
    this.sub('nav', data => {
      this.setState({nav: data})
    })
    this.sub('user', data => {
      this.setState({user: data})
    })
    this.sub('message', data => {
      this.setState({message: Object.assign(data, {isOpen: true})})
    })
  }

  render() {
    return (
      <div style={merge(layoutStack, {marginBottom: '120px'})}>
        <Theme theme={lightTheme}>
          <div style={layoutStack}>
            <AppHeader pub={this.pub} sub={this.sub} user={this.state.user} />
            <AppNav pub={this.pub} sub={this.sub} nav={this.state.nav} />
          </div>
        </Theme>
        <Theme theme={lightTheme}>
          <div style={layoutStack}>
            <Switch>
              <Route exact path="/" component={Home}/>
              <Route path='/category/:id' render={
                ({match}) => {
                  return <Items pub={this.pub} sub={this.sub} id={match.params.id} />
                }
              } />
              <Route path='/item/:id' component={Item}/>
              <Route path='/edit/item/:id' component={EditItem}/>
              <Route path='/edit/category/:id' component={EditCategory}/>
            </Switch>
          </div>
        </Theme>
        <Theme theme={darkTheme}>
          <div
            style={{position: 'fixed', bottom: '80px', right: '80px', paddingTop: '1em'}}
          >
            <FloatingActionButton
              onTouchTap={ev => this.setState({fab: {
                isOpen: !this.state.fab.isOpen,
                anchor: ev.currentTarget.parentElement.parentElement
              }})}
            >
              <ContentAdd />
              <Theme theme={lightTheme}>
                <Popover
                  open={this.state.fab.isOpen}
                  anchorEl={this.state.fab.anchor}
                  anchorOrigin={{horizontal: 'middle', vertical: 'top'}}
                  targetOrigin={{horizontal: 'middle', vertical: 'bottom'}}
                  onRequestClose={ev => this.setState({fab: {isOpen: !this.state.fab.isOpen, anchor: null}})}
                  style={{overflowY: 'visible'}}
                >
                  <Menu autoWidth={false}>
                    <MenuItem>
                      <span title='Add Item'>
                        <ContentAddBox />
                      </span>
                    </MenuItem>
                    <MenuItem>
                      <span title='Add Category'>
                        <AvLibraryAdd />
                      </span>
                    </MenuItem>
                  </Menu>
                </Popover>
              </Theme>
            </FloatingActionButton>
          </div>
        </Theme>
        <Theme theme={darkTheme}>
          <Snackbar
            open={this.state.message.isOpen}
            message={this.state.message.content}
            action={this.state.message.action}
            autoHideDuration={this.state.message.duration || 2000}
            onRequestClose={reason => {
              if(reason == 'timeout')
                this.setState({message: {isOpen: false, content: ''}})
            }}
          />
        </Theme>
      </div>
    )
  }
}

export default App
