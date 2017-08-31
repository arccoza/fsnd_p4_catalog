// import Kitchen from './kitchen'
import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
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
import api from './api'
var print = console.log.bind(console)


const googleScriptSrc = '//apis.google.com/js/platform.js'
const facebookScriptSrc = '//connect.facebook.net/en_US/sdk.js'
const authProviders = {}

authProviders['google'] = new Auth({provider: 'google', scriptSrc:googleScriptSrc, cred:{
  'clientId': '32902065428-sbal87ccp0eedjoo2opcq0tr22ha3884.apps.googleusercontent.com',
  'scope': 'profile email'
}})

authProviders['facebook'] = new Auth({provider: 'facebook', scriptSrc:facebookScriptSrc, cred:{
  'appId': '126309204593715',
  'cookie': true,
  'xfbml': true,
  'version': 'v2.9',
  'scope': 'email'
}})


window.authProviders = authProviders

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

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

const Item = ({ match }) => (
  <div>
    <h2>Item</h2>
    <h3>{match.params.id}</h3>
  </div>
)

const Category = ({ match }) => (
  <div>
    <h2>Category</h2>
    <h3>{match.params.id}</h3>
  </div>
)

const EditItem = ({ match }) => (
  <div>
    <h2>Edit Item</h2>
    <h3>{match.params.id}</h3>
  </div>
)

const EditCategory = ({ match }) => (
  <div>
    <h2>Edit Category</h2>
    <h3>{match.params.id}</h3>
  </div>
)

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      categories: [],
      items: [],
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
    this.sub('categories', data => {
      this.setState({categories: data})
    })
    this.sub('items', data => {
      this.setState({items: data})
    })
    this.sub('message', data => {
      this.setState({message: Object.assign(data, {isOpen: true})})
    })

    this.fetch()
  }

  fetch = () => {
    var cats = api.get('categories')
    .then(resp => {
      this.setState({categories: resp})
    })
    .catch(err => {
      this.props.pub('message', {isOpen:true, content: 'Couldn\'t load categories.'})
    })

    var items = api.get('items')
    .then(resp => {
      this.setState({items: resp})
    })
    .catch(err => {
      this.props.pub('message', {isOpen:true, content: 'Couldn\'t load items.'})
    })

    return Promise.all([cats, items])
  }

  render() {
    return (
      <div style={{...layoutStack, ...{marginBottom: '120px'}}}>
        <Theme theme={lightTheme}>
          <div style={layoutStack}>
            <AppHeader
              pub={this.pub}
              sub={this.sub}
              user={this.state.user} />
            <AppNav
              pub={this.pub}
              sub={this.sub}
              nav={this.state.nav}
              categories={this.state.categories}
              items={this.state.items} />
          </div>
        </Theme>
        <Theme theme={lightTheme}>
          <div style={layoutStack}>
            <Switch>
              <Route exact path="/" component={Home}/>
              <Route path='/:mode(view|edit))' exact component={Items} params={{id: null}}/>
              <Route path='/:mode(view|edit)/:id' exact component={Items} params={{id: null}}/>
              <Route path='/:mode(view)/:cat/:id' exact component={Items} params={{id: null}}/>
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
