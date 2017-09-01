import React from 'react'
import {lightTheme, darkTheme, Theme} from './react-themes'
import {GridList, GridTile, Subheader, TextField, SelectField,
  MenuItem, Paper, RaisedButton} from './widgets'
import {EditItem} from './react-app-items-edit'
import {layout, modify} from './utils'
import api from './api.js'
var h = React.createElement
var print = console.log.bind(console)


const tilesData = [
  {
    image: 'images/grid-list/00-52-29-429_640.jpg',
    title: 'Breakfast',
    author: 'jill111',
  },
  {
    image: 'images/grid-list/burger-827309_640.jpg',
    title: 'Tasty burger',
    author: 'pashminu',
  },
  {
    image: 'images/grid-list/camera-813814_640.jpg',
    title: 'Camera',
    author: 'Danson67',
  },
  {
    image: 'images/grid-list/morning-819362_640.jpg',
    title: 'Morning',
    author: 'fancycrave1',
  },
  {
    image: 'images/grid-list/hats-829509_640.jpg',
    title: 'Hats',
    author: 'Hans',
  },
  {
    image: 'images/grid-list/honey-823614_640.jpg',
    title: 'Honey',
    author: 'fancycravel',
  },
  {
    image: 'images/grid-list/vegetables-790022_640.jpg',
    title: 'Vegetables',
    author: 'jill111',
  },
  {
    image: 'images/grid-list/water-plant-821293_640.jpg',
    title: 'Water plant',
    author: 'BkrmadtyaKarki',
  },
]

export default class Items extends React.Component {
  constructor(props) {
    super(props)

    this.modify = modify.bind(this)

    this.state = {
      categories: [{
          id: '',
          title: 'hello',
        }],
      items: tilesData,
      curItem: {
        id: null,
        image: null,
        title: '',
        description: '',
        categories: [],
        author: 'Brock Samson',
      },
      curImage: {
        id: null,
        name: '',
        type: null,
        blob: null,
      }
    }
  }

  componentDidMount = () => {
    // this.fetch()
  }

  fetch = () => {
    return api.get('categories', this.props.id)
    .then(resp => {
      // this.setState({categories: resp})
      this.state.categories = resp
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
    // print(this.props.match)
    var content
    var setField = (...args) => ev => this.modify(ev.target.value, ...args)

    if (this.props.match.params.mode == 'edit') {
      content = EditItem({...this.state, setField})
    }
    else {
      content = [
        h('h2', null, 'View'),
        h(GridList, {cellHeight: 180, cols: 4},
          h(Subheader, null, 'December'),
          this.state.items.map((item) => (
            h(GridTile, {key: item.id, title: item.title, subtitle: item.author},
              h('img', {src: item.image})
            )
          ))
        )
      ]
    }

    return h(Theme, {theme: darkTheme},
      h('div', {style: layout({dr: 'v.', mg: '20px 180px 20px 180px'})},
        ...content
      )
    )
  }
}
