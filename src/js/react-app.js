import Kitchen from './kitchen'
import React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {lightTheme, darkTheme} from './react-themes'
import AppBar from 'material-ui/AppBar'
import FlatButton from 'material-ui/FlatButton'
import DropDownMenu from 'material-ui/DropDownMenu'
import MenuItem from 'material-ui/MenuItem'
import Toggle from 'material-ui/Toggle'
import {GridList, GridTile} from 'material-ui/GridList'
import IconButton from 'material-ui/IconButton'
import StarBorder from 'material-ui/svg-icons/toggle/star-border'
import Subheader from 'material-ui/Subheader'


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

const layout = {
  display: 'flex',
  flexFlow: 'column wrap',
  justifyContent: 'space-between',
  alignContent: 'center',
  alignItems: 'center',
}

const App = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(themeDark)}>
    <div style={layout}>
      <div className={'bg'}></div>
      <AppBar
        style={{boxShadow: 0, borderBottom: '1px solid rgba(255, 255, 255, 0.3)'}}
        title="Title"
        iconElementRight={<FlatButton label="Signin" secondary={true} />}
      />
      <div>
        <DropDownMenu>
          <MenuItem value={1} primaryText="Never" />
          <MenuItem value={2} primaryText="Every Night" />
          <MenuItem value={3} primaryText="Weeknights" />
          <MenuItem value={4} primaryText="Weekends" />
          <MenuItem value={5} primaryText="Weekly" />
        </DropDownMenu>
        <Toggle
          label="Simple"
          defaultToggled={false}
        />
      </div>
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
  </MuiThemeProvider>
)

const AppKitchen = () => (
  <MuiThemeProvider muiTheme={getMuiTheme(darkTheme)}>
      <Kitchen />
  </MuiThemeProvider>
)

export default AppKitchen
