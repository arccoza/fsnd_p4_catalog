import React from 'react'
import {GridList, GridTile} from 'material-ui/GridList'
import Subheader from 'material-ui/Subheader'
import api from './api.js'


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

export default class Items extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      categories: [],
      items: []
    }
  }

  componentDidMount = () => {
    this.fetch()
  }

  fetch = () => {
    return api.get('categories', this.props.id)
    .then(resp => {
      this.setState({categories: resp})
      return resp
    })
    .then(resp => {
      // Gather all the ids from each category into one array
      var ids = resp.reduce((acc, val) => acc.concat(val.items), [])
      return api.get('items', ids)
    })
    .then(resp => {
      this.setState({items: resp})
      return resp
    })
    .catch(err => {
      this.props.pub('message', {isOpen:true, content: 'Couldn\'t load content.'})
    })
  }

  render() {
    return (
      <div style={merge(layoutStack, {margin: '20px 180px 20px 180px'})}>
        <GridList cellHeight={180} cols={4}>
          <Subheader>December</Subheader>
          {this.state.items.map((item) => (
            <GridTile
              key={item.id}
              title={item.title}
              subtitle={<span>by <b>{item.author}</b></span>}
            >
              <img src={item.image} />
            </GridTile>
          ))}
        </GridList>
      </div>
    )
  }
}
