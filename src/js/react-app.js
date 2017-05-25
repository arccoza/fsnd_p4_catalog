import Kitchen from './kitchen'
import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {lightTheme, darkTheme} from './react-themes'
import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Dialog from 'material-ui/Dialog'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import Toggle from 'material-ui/Toggle'
import {GridList, GridTile} from 'material-ui/GridList'
import IconButton from 'material-ui/IconButton'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'
import Subheader from 'material-ui/Subheader'
import FontIcon from 'material-ui/FontIcon'
import PropTypes from 'prop-types'


console.log(lightTheme, darkTheme)

const tilesData = [
  {
    img: 'images/grid-list/00-52-29-429_640.jpg',
    title: 'Breakfast',
    author: 'jill111',
  },
  {
    img: 'images/grid-list/burger-827309_640.jpg',
    title: 'Tasty burger',
    author: 'pashminu',
  },
  {
    img: 'images/grid-list/camera-813814_640.jpg',
    title: 'Camera',
    author: 'Danson67',
  },
  {
    img: 'images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    author: 'fancycrave1',
  },
  {
    img: 'images/grid-list/hats-829509_640.jpg',
    title: 'Hats',
    author: 'Hans',
  },
  {
    img: 'images/grid-list/honey-823614_640.jpg',
    title: 'Honey',
    author: 'fancycravel',
  },
  {
    img: 'images/grid-list/vegetables-790022_640.jpg',
    title: 'Vegetables',
    author: 'jill111',
  },
  {
    img: 'images/grid-list/water-plant-821293_640.jpg',
    title: 'Water plant',
    author: 'BkrmadtyaKarki',
  },
]

const Theme = (props) => (
  <MuiThemeProvider muiTheme={getMuiTheme(props.theme)}>
    {props.children}
  </MuiThemeProvider>
)

class Print extends React.Component {
  static contextTypes = {
    muiTheme: PropTypes.object.isRequired,
  }

  render() {
    print(this.context)
    return <div>{this.props.children}</div>
  }
}

const vlayout = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'center',
}

const hlayout = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'center',
}

const layoutStack = {
  position: 'relative',
  display: 'flex',
  width: '100%',
  flexFlow: 'column nowrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'center',
}

function merge(...objs) {
  return Object.assign({}, ...objs)
}

class AppHeader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isAuthed: false,
      dialogOpen: false,
    }
  }

  _openDialog = () => {
    this.setState({dialogOpen: true})
  }

  _closeDialog = () => {
    this.setState({dialogOpen: false})
  }

  render() {
    // const comps = []
    if(!this.state.isAuthed) {
      var appBar = (
        <div style={layoutStack}>
          <AppBar style={{
              backgroundColor: 'transparent',
              borderBottom: '1px solid white',
              borderBottomColor: lightTheme.palette.borderColor,
            }}
            title="Catalog"
            iconElementRight={<FlatButton label='Signin' onTouchTap={this._openDialog}/>}
          />
          <Dialog
            title='Sigin with...'
            actions={[
                <FlatButton label='Cancel' onTouchTap={this._closeDialog} />
              ]}
            modal={false}
            open={this.state.dialogOpen}
            onRequestClose={this._closeDialog}
          >
            <div style={merge(hlayout, {justifyContent: 'space-around'})}>
              <RaisedButton
                label='Facebook'
                labelPosition='after'
                primary={true}
                icon={<FontIcon className='socicon-facebook' />}
                buttonStyle={{backgroundColor: '#3e5b98'}}
              />
              <RaisedButton
                label='Google'
                labelPosition='after'
                primary={true}
                icon={<FontIcon className='socicon-google' />}
                buttonStyle={{backgroundColor: '#dd4b39'}}
              />
            </div>
          </Dialog>
        </div>
      )
    }

    return appBar
  }
}

class App extends React.Component {
  render() {
    return (
      <div style={layoutStack}>
        <Theme theme={lightTheme}>
          <AppHeader />
        </Theme>
        <Theme theme={lightTheme}>
          <div style={layoutStack}>
            <DropDownMenu>
              <MenuItem value={1} primaryText="Never" />
              <MenuItem value={2} primaryText="Every Night" />
              <MenuItem value={3} primaryText="Weeknights" />
              <MenuItem value={4} primaryText="Weekends" />
              <MenuItem value={5} primaryText="Weekly" />
            </DropDownMenu>
            <GridList cellHeight={180} cols={4} style={{width: '80%'}}>
              <Subheader>December</Subheader>
              {tilesData.map((tile) => (
                <GridTile
                  key={tile.img}
                  title={tile.title}
                  subtitle={<span>by <b>{tile.author}</b></span>}
                  actionIcon={<IconButton><StarBorder color="white" /></IconButton>}
                >
                  <img src={tile.img} />
                </GridTile>
              ))}
            </GridList>
          </div>
        </Theme>
      </div>
    )
  }
}

export default App
